//测试任务
function list_plan(params) {
  $.ajax({
    type: 'get',
    data: params,
    url: '/api/plans/',
    cache: false,
    contentType: 'application/json; charset=utf-8',
    success: function (result, TextStatus) {
      if (result.retcode === 200) {
        repaint_planlist(result);
      } else if (result.retcode === 403) {
        console.log('未登录,开始重定向')
        location.href = result.to
      }
    },
    error: function () {
      console('获取失败')
    },
  })
}

//重绘页面
function repaint_planlist(result) {
  retlist = result.retlist;
  //先删除列表现有内容
  $('.card-body tbody tr').remove()
  //添加新的内容
  if (retlist.length > 0) {
    for (const res of retlist) {
      let tr = $('<tr></tr>')
      //创建行内容
      tr.append($('<td></td>').text(res.id),
        $('<td></td>').text(res.name),
        $('<td></td>').text(res.project ? res.project.name : 'N/A'),
        $('<td></td>').text(res.executor ? res.executor.username : 'N/A'),
        $('<td></td>').text(res.environment ? res.environment.desc : 'N/A'),
        $('<td></td>').text(res.status),
        $('<td></td>').text(res.exec_counts),
        $('<td></td>').text(res.desc),
        $('<td></td>').append($('<button></button>').text('运行').addClass('btn btn-pill btn-sm btn-success').click(function () {
            run_plan(res.id);
          }),
          $('<a></a>').text('查看').addClass('btn btn-pill btn-sm btn-info').attr('href', `plan_view.html?plan_id=${res.id}`),
          $('<button></button>').text('删除').addClass('btn btn-pill btn-sm btn-danger').attr('data-toggle', "modal").attr('data-target', "#dangerModal")),
      );

      $('.card-body tbody').append(tr) //添加数据
    }
  }
}

//新增测试项目表单
function attach_plan(params) {
  //项目
  common_attach('/api/projects/', '[name="project_id"]');
  //项目关联模块更新
  //select_onchange('[name="project_id"]','[name="module_id"]','/api/module/')
  //项目关联环境更新
  select_onchange('[name="project_id"]', '[name="env_id"]', '/api/envs/')
  // 选择用户
  common_attach('api/users/', '[name="executor_id"]')
}

//新增测试计划表单
function new_plan() {
  const csrftoken = getCookie('csrftoken'); //从cookie获取django的crsftoken
  //获取信息
  let env_id = $('[name="env_id"] option:selected').val();
  let executor_id = $('[name="executor_id"]').val();
  let name = $('[name="name"]').val();
  let desc = $('[name="desc"]').val();
  //提交
  $.ajax({
    type: 'post',
    data: JSON.stringify({'desc': desc, 'name': name, 'environment_id': env_id, 'executor_id': executor_id}),
    url: '/api/plans/',
    cache: false,
    contentType: 'application/json; charset=utf-8',
    headers: {'X-CSRFToken': csrftoken},
    success: function (result, TextStatus) {
      console.log('success');
      $('[data-dismiss="modal"]').click();
      console.log(result);
      list_plan(); //重新列出测试计划
    },
    error: function (result, TextStatus) {
      console.log('fail');
      $('[data-dismiss="modal"]').click();
      console.log(result);
    },
  })
}

//plan详情页面
function plan_view(plan_id) {
  $.ajax({
    type: 'get',
    url: `/api/plans/${plan_id}/`,
    async: true,
    contentType: 'application/json; charset=utf-8',
    success: function (result, textStatus) {
      if (result.retcode === 200) {
        repaint_plan_view(result);
      } else if (result.retcode === 403) {
        console.log('未登录,开始重定向')
        location.href = result.to
      }
    },
    error: function () {
      console.log('没找到哦');
    }
  });
  //绑定修改按钮点击方法---提交修改
  $('[type="submit"]').click(function () {
    update_testplan(plan_id);
  })
}

function repaint_plan_view(result) {
  let plan = result.retlist[0];
  $('input[name="name"]').val(plan.name);
  $('input[name="desc"]').val(plan.desc);
  //更新下拉列表--项目
  common_attach('/api/projects/', 'select[name="project_id"]', plan.environment.project.id);
  //更新下拉列表--环境
  common_attach('/api/envs/', 'select[name="env_id"]', plan.environment.id);
  select_onchange('select[name="project_id"]', 'select[name="env_id"]', '/api/envs/',);
  // 更新下拉列表--用户
  common_attach('/api/users/','select[name="executor_id"]',plan.executor.id)
  //拷贝例行模板
  let row_temp = $('.card-footer tbody tr:nth-last-child(1)');

  //测试用例刷新
  if (plan.cases.length > 0) {
    console.log('update caselist')
    //删除所有行
    $('.card-footer tbody tr').each(function () {
      $(this).remove();
    });
    for (let testcase of plan.cases) {
      //新增一行
      $('.card-footer tbody').append(row_temp[0].outerHTML);
      //填充用例
      let retlist = common_attach('/api/cases/', 'tr:nth-last-child(1) select[name="case_id"]',
        testcase.id,);
      $('.card-footer tbody tr:nth-last-child(1) input[name="case_desc"]').val(testcase.desc);
      // 绑定selected 点击事件
      $('.card-footer tbody tr:nth-last-child(1) [name="case_id"]').change(function (){
        let case_id = $(this).children('option:selected').val();
        let desc_input = $(this).parent().parent().find('[name="case_desc"]');
        // 根据case_id 提取 plan.cases对应的数据
        for(const item of retlist){
          if(case_id == item.id){
            // console.log(item.desc);
            desc_input.val(item.desc); // 回填描述
          }
        }
      });
    }
  } else {
    // 更新用例下拉
    let retlist = common_attach('/api/cases/', 'select[name="case_id"]');
    // 测试用例
    $('.card-footer tbody tr:nth-last-child(1) input[name="case_desc"]').val(retlist[0].desc);
    // 绑定selected 点击事件
    $('.card-footer tbody tr:nth-last-child(1) [name="case_id"]').change(function (){
      let case_id = $(this).children('option:selected').val();
      let desc_input = $(this).parent().parent().find('[name="case_desc"]');
      // 根据case_id 提取 plan.cases对应的数据
      for(const item of retlist){
        if(case_id == item.id){
          // console.log(item.desc);
          desc_input.val(item.desc); // 回填描述
        }
      }
    });
  }
}

//提交修改
function update_testplan(id) {
  const csrftoken = getCookie('csrftoken'); //从cookie获取django的crsftoken
  //获取信息
  const name = $('input[name="name"]').val();
  const desc = $('input[name="desc"]').val();
  const env_id = parseInt($('select[name="env_id"] option:selected').val());
  const executor_id = parseInt($('select[name="executor_id"] option:selected').val());
  let cases = []
  $('select[name="case_id"] option:selected').each(function () {
    cases.push($(this).val())
  });  //测试用例sID

  //提交信息
  $.ajax({
    type: 'put',
    data: JSON.stringify({'name': name, 'desc': desc, 'environment_id': env_id,'executor_id':executor_id, 'case_ids': cases}),
    url: `/api/plans/${id}/`,
    contentType: 'application/json; charset=utf-8',
    headers: {'X-CSRFToken': csrftoken},
    success: function (result, TextStatus) {
      console.log('success')
      //返回计划列表页面
      window.location.href = 'testplan.html'
    },
    error: function (result, TextStatus) {
      console.log('fail' + result.msg)
    },
  })
}
// import Swal from 'libs/sweetalert2'
//运行测试计划
function run_plan(id) {
  Swal.fire({
    icon: 'success',
    title: '运行测试计划'+id ,
    showConfirmButton: false,
    timer: 1500
  })
  $.ajax({
    type: 'get',
    url: `/api/plans/${id}/run/`,
    contentType: 'application/json; charset=utf-8',
    success: function () {
      Swal.fire({
        icon: 'success',
        title: '运行成功'+id ,
        showConfirmButton: false,
        timer: 1500
      })
    },
    error: function () {
      Swal.fire({
        icon: 'error',
        title: '运行失败，服务器错误' ,
        showConfirmButton: false,
        timer: 1500
      })
    }
  })
}

function delete_plan(_id) {
  return common_delete(_id, '/api/plans/')
}

function addFunctionAlty(value, row, index) {
  return [
    '<button id="run" class="btn btn-pill btn-sm btn-success" >运行</button>',
    `<a id="edit" class="btn btn-pill btn-sm btn-info" href="plan_view.html?plan_id=${row.id}">编辑</a>`,
    '<button id="delete" class="btn btn-pill btn-sm btn-danger" data-toggle="modal" data-target="#delete_modal">删除</button>',
  ].join('');
}

let operateEvents = {
  'click #run': function (e, value, row, index) {
    run_plan(row.id);
  },
  'click #edit': function (e, value, row, index) {

  }, 'click #delete': function (e, value, row, index) {
    function to_delete_item() {
      console.log('delete,row: ' + row.id)
      delete_plan(row.id)
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
  title: '计划名称',
  field: 'name',
}, {
  title: '项目',
  field: 'environment.project.name',
}, {
  title: '测试人员',
  field: 'executor.username',
}, {
  title: '测试环境',
  field: 'environment.desc',
}, {
  title: '状态',
  field: 'status',
  formatter: parse_status,
}, {
  title: '执行次数',
  field: 'exec_counts',
}, {
  title: '描述',
  field: 'desc',
}, {
  title: '操作',
  events: operateEvents,//给按钮注册事件
  formatter: addFunctionAlty//表格中增加按钮
}
];

function parse_status(value, row, index) {
  let span = $('<span></span>').addClass('badge')
  if (value === '未运行') {
    span.addClass('badge-light').text('未运行')
  } else if (value === '执行中') {
    span.addClass('badge-info').text('执行中')
  } else if (value === '中断') {
    span.addClass('badge-warning').text('中断')
  } else if (value === '已执行') {
    span.addClass('badge-success').text('已执行')
  } else {
    span.addClass('badge-default').text('unknown')
  }
  return span.prop("outerHTML")  //返回html内容
}