//======================================private fun====================================

//用例详情
function case_view(case_id) {
  $.ajax({
    type: 'get',
    // data: {'id': case_id},
    url: `/api/cases/${case_id}/`,
    contentType: 'application/json; charset=utf-8',
    success: function (result, textStatus) {
      if (result.retcode === 200) {
        paint_case_view(result); //加载用例主体信息
        paint_steps_view(result);
      } else if (result.retcode === 403) {
        console.log('未登录,开始重定向')
        location.href = result.to
      }
    },
    error: function () {
      console.log('没找到哦');
    }
  });
}

function paint_case_view(result) {
  let testcase = result.retlist[0];
  let config = testcase.config
  // 更新common部分
  $('input[name="file_path"]').val(testcase.file_path);  //更新路径
  $('input[name="desc"]').val(testcase.desc);  // desc
  let pro_id = config.project ? config.project.id : 1
  common_attach('/api/projects/', 'select[name="project_id"]', pro_id);//更新下拉列表--项目
  // 更新Config部分
  $('input[name="name"]').val(config.name);
  $('input[name="base_url"]').val(config.base_url);
  $('textarea[name="variables"]').val(JSON.stringify(config.variables));
  $('textarea[name="parameters"]').val(JSON.stringify(config.parameters));
  $('textarea[name="export"]').val(JSON.stringify(config.export));
  $('.c-switch-input[name="verify"]').prop('checked', config.verify);
}

function paint_steps_view(result) {
  let step_columns = [{
    title: 'No',
    field: 'sorted_no',
    width: 50
  }, {
    title: 'Step Content',
    formatter: editFormatter,
    valign: 'middle',
  }, {
    title: '操作',
    events: stepEvents, //给按钮注册事件
    formatter: handelStepOperate, //表格中增加按钮
    width: 150
  }]
  let teststeps = result.retlist[0].teststeps
  // console.log(teststeps)
  let default_values = {"name": "1", "variables": "2", "extract": "3", "validate": "4", "setup_hooks": 5}
  detail_view_talbe('#detail_view', teststeps, step_columns, [default_values]);    // 加载测试步骤信息
}

let stepEvents = {
  'click #save': function (e, value, row, index) {
    console.log('save row: ' + row.id);
  },
  'click #delete': function (e, value, row, index) {
    function to_delete_item() {
      console.log('remove row: ' + row.id)
      // let _row=$(this).parent().parent();
      $('#detail_view').bootstrapTable('remove',{
        field:'sorted_no',
        values:[parseInt(row.sorted_no)]
      });
    }
    $('.modal-footer .btn-danger').unbind('click').click(to_delete_item);
  },
}

function handelStepOperate(value, row, index) {
  return [
    '<button id="delete" class="btn btn-pill btn-sm btn-outline-danger" data-toggle="modal" data-target="#delete_modal">删除</button>',
    `<button id="save" class="btn btn-pill btn-sm btn-outline-info" ">保存</button>`,
  ].join('');
}

//开关切换
function switch_btn() {
  $('span.c-switch-slider').bind('click', function () {
    let status_btn = $('.c-switch-input[name="status"]')
    if (status_btn.val() === 'true') {
      // console.log('set false...')
      status_btn.val(false);
    } else {
      // console.log('set true...')
      status_btn.val(true);
    }
  });
}

function new_line_step() {
  $('.card-footer>.btn-warning').bind('click', function () {
    let tr = $('.card-footer tbody tr:nth-last-child(1)')[0].outerHTML;
    let num = $(tr).children('td:nth-child(1)').text();
    num = isNaN(num)?1:parseInt(num) + 1 //判断是否为数字
    let belong_case_id = getUrlParam('case_id')
    let default_values = {
      "name": "step_name", "variables": {}, "request": {"method":"GET","url":"/demo/path"},
      "extract": {}, "validate": [], "setup_hooks": [], "teardown_hooks": [],
      "sorted_no":num,"belong_case_id":belong_case_id
    }
    $('#detail_view').bootstrapTable('append', default_values);
  })
}

//新增step输入框
function _old_line_step() {
  //添加一行
  $('.card-footer>.btn-warning').bind('click', function () {
    //拷贝最后一行
    let tr = $('.card-footer tbody tr:nth-last-child(1)')[0].outerHTML;
    let num = $(tr).find('td>h5').text();
    num = parseInt(num) + 1  //序号自增
    let new_line = $(tr);
    new_line.find('td:nth-child(1)').html('<h5>' + num + '</h5>'); //自增的ID回写HTML
    $('.card-footer tbody').append(new_line[0].outerHTML);
  });
}

//保存step
function save_step(target, case_id) {
  const csrftoken = getCookie('csrftoken');
  //逻辑--如果存在就发送修改请求，如果不存在，就发送创建请求
  let _id = $(target).parent().parent().find('td:nth-child(1) span').attr('title');
  let step_no = $(target).parent().parent().find('td:nth-child(1)').text();
  let httpapi_id = $(target).parent().parent().find('[name="httpapi_id"]').val();
  let expected = $(target).parent().parent().find('[name="expect"]').val();
  let step_desc = $(target).parent().parent().find('[name="step_desc"]').val();
  console.log(_id)
  if (_id) {
    $.ajax({
      type: 'put',
      data: JSON.stringify({
        'step_no': step_no,
        'httpapi_id': httpapi_id,
        'expected': expected,
        'desc': step_desc,
        'case_id': case_id,
        'status': 0
      }),
      url: '/api/step/?id=' + _id,
      contentType: 'application/json; charset=utf-8',
      headers: {'X-CSRFToken': csrftoken},
      success: function (result, TextStatus) {
        console.log('success');
      },
      error: function (result, TextStatus) {
        console.log('fail' + result.msg);
      },
    })
  } else {
    $.ajax({
      type: 'post',
      data: JSON.stringify({
        'step_no': step_no,
        'httpapi_id': httpapi_id,
        'expected': expected,
        'desc': step_desc,
        'case_id': case_id,
        'status': 0
      }),
      url: '/api/step/',
      cache: false,
      contentType: 'application/json; charset=utf-8',
      headers: {'X-CSRFToken': csrftoken},
      success: function (result, TextStatus) {
        //回写ID
        $(target).parent().parent().find('td:nth-child(1)').append('<span></span>');
        $(target).parent().parent().find('td:nth-child(1) span').attr('title', result.id)
        //再新增1行

      },
      error: function (result, TextStatus) {
        console.log('fail' + result.msg);
      },
    })
  }
}

//删除步骤
function delete_step(target) {
  const csrftoken = getCookie('csrftoken')
  let _id = $(target).parent().parent().find('td:nth-child(1) span').attr('title');
  if (_id) {
    $.ajax({
      type: 'delete',
      data: {},
      url: '/api/step/?id=' + _id,
      contentType: 'application/json; charset=utf-8',
      headers: {'X-CSRFToken': csrftoken},
      success: function (result, TextStatus) {
        //判断请求的retcode
        let retcode = result.retcode
        if (retcode === 200) {
          //删除该行
          $(target).parent().parent().remove();
          resort_stepNO();
        } else {
          console.log('删除失败');
        }
      },
      error: function (result, TextStatus) {
        console.log('fail' + result.msg);
      },
    })
  } else {
    $(target).parent().parent().remove();
    resort_stepNO();
  }
}

//提交用例修改
function update_case(_id) {
  const csrftoken = getCookie('csrftoken');
  //common部分
  const desc = $('input[name="desc"]').val();
  const file_path = $('input[name="file_path"]').val();
  const project_id = $('select[name="project_id"] option:selected').val();
  // config部分
  const name = $('input[name="name"]').val();
  const base_url = $('input[name="base_url"]').val();
  const variables = JSON.parse($('textarea[name="variables"]').val());
  const parameters = JSON.parse($('textarea[name="parameters"]').val());
  const verify = JSON.parse($('.c-switch-input[name="verify"]').prop("checked"));
  const export_ = JSON.parse($('textarea[name="export"]').val())

  // let teststeps = $('#detail_view').bootstrapTable('getData',{'includeHiddenRows':true});  // 从序号到测试步骤

  let teststeps=[]
  $('#detail_view textarea').each(function (){
    let step = JSON.parse($(this).val());
    teststeps.push(step);
  })
  let config ={'name': name,'base_url': base_url,}
  if(variables){config["variables"]=variables}
  if(parameters){config["parameters"]=parameters}
  if(verify){config["verify"]=verify}
  if(export_){config["export"]=export_}

  let kwargs = {
    'desc': desc,
    'file_path': file_path,
    'teststeps': teststeps,
    'project_id':project_id,
    'config':config
  }
  // console.log(kwargs)
  //提交信息
  $.ajax({
    type: 'put',
    data: JSON.stringify(kwargs),
    url: `/api/cases/${_id}/`,
    contentType: 'application/json; charset=utf-8',
    headers: {'X-CSRFToken': csrftoken},
    success: function (result, TextStatus) {
      console.log('update success');
      //返回测试用例列表
      window.location.href = 'testcase.html';
    },
    error: function (result, TextStatus) {
      // console.log('update fail');
      alert("服务器错误，修改失败");
    },
  })
}

async function choose_file(){
  const csrftoken = getCookie('csrftoken');
  const { value: file } = await Swal.fire({
    title: '上传用例文件',
    input: 'file',
    inputAttributes: {
      'accept': '*/*',
      'aria-label': 'Upload your case'
    }
  })

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      Swal.fire({
        title: '上传完成',
        imageUrl: e.target.result,
        imageAlt: 'The uploaded picture'
      })
    }
    reader.readAsDataURL(file)

    let formData = new FormData();
    let file_content = $('.swal2-file')[0].files[0];
    // let file_content = file
    formData.append("case_file", file_content);
    // console.log(file_content)
    $.ajax({
      headers: { 'X-CSRFToken': csrftoken },
      method: 'put',
      url: `/api/upload/${file_content.name}/`,
      data: formData,
      processData: false,
      contentType: false,
      success: function (resp) {
        Swal.fire('Uploaded', 'Your file have been uploaded', 'success');
      },
      error: function() {
        Swal.fire({ type: 'error', title: 'Oops!', text: 'Something went wrong!' })
      }
    })
  }
}
//新增测试用例表单
function attach_case(params) {
  //项目
  common_attach('/api/projects/', '[name="project_id"]');
  //项目关联模块更新
  //select_onchange('[name="project_id"]', '[name="module_id"]', '/api/module/')
}

function new_case() {
  const csrftoken = getCookie('csrftoken');
  //收集数据
  let project_id = $('select[name="project_id"] option:selected').val();
  let name = $('input[name="name"]').val();
  let desc = $('input[name="desc"]').val();
  //提交
  $.ajax({
    type: 'post',
    data: JSON.stringify({'desc': desc, 'config': {'name': name}, 'project_id': project_id}),
    url: '/api/cases/',
    cache: false,
    contentType: 'application/json; charset=utf-8',
    headers: {'X-CSRFToken': csrftoken},
    success: function (result, TextStatus) {
      $('[data-dismiss="modal"]').click();
      $('#res_table').bootstrapTable('refresh'); //刷新
    },
    error: function (result, TextStatus) {
      $('[data-dismiss="modal"]').click();
      alert('服务器错误，添加失败');
    },
  })
}

function delete_case(_id) {
  return common_delete(_id, '/api/cases/')
}

function addFunctionAlty(value, row, index) {
  return [
    `<a id="edit" class="btn btn-pill btn-sm btn-info" href="case_view.html?case_id=${row.id}">查看</a>`,
    '<button id="delete" class="btn btn-pill btn-sm btn-danger" data-toggle="modal" data-target="#delete_modal">删除</button>',
  ].join('');
}

let operateEvents = {
  'click #edit': function (e, value, row, index) {
  }, 'click #delete': function (e, value, row, index) {
    function to_delete_item() {
      console.log('delete,row: ' + row.id)
      delete_case(row.id)
    }

    $('.modal-footer .btn-danger').unbind('click').click(to_delete_item);
  },
};

const columns = [{
  checkbox: true
}, {
  title: 'ID',
  field: 'id',
  visible: false
}, {
  title: '用例名称',
  field: 'config.name',
}, {
  title: '所属项目',
  field: 'config.project.name',
}, {
  title: '文件路径',
  field: 'file_path',
}, {
  title: '创建时间',
  field: 'create_time',
  cellStyle: formatTableUnit,
  formatter: paramsMatter,
}, {
  title: '更新时间',
  field: 'update_time',
  cellStyle: formatTableUnit,
  formatter: paramsMatter,
}, {
  title: '操作',
  events: operateEvents,//给按钮注册事件
  formatter: addFunctionAlty//表格中增加按钮
}
]