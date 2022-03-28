function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数
  if (r != null) return encodeURI(r[2]);
  return null; //返回参数值
}


function getCookie(name) {
  let arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg)) return unescape(arr[2]);
  else return null;
}


function handler_alert(selector, tips) {
  //先清空其他警告信息
  $('[type="alert"]').each(function () {
    $(this).css('display', 'none')
  })
  $(selector).css('display', 'block')
  if (tips) {
    $(selector).text(tips)
  }
  $(selector).click(function () {
    $(this).css('display', 'none')
  })
  return null
}

function current_user() {
  $.ajax({
    type: 'get',
    url: '/api/current_user/',
    success: function (result, textStatus) {
      //判断当前用户是否处于登录状态
      if (result.retcode === 200) {
        //设置跑马灯文本
        let context = result.retlist[0]
        let txt = context.realname ? context.realname : context.username
        $('.c-header-nav.d-md-down-none a').text('欢迎 ' + txt + '~')
      } else {
        console.log('未检测到登录用户')
      }
    },
    error: function () {
      console.log('current_user 请求失败')
    }
  });
}

//返回表格数据：参数: 列头，列尾
function table_data(start_col, end_col) {
  let tb_keys = [];  //表头
  $('thead tr').children().slice(start_col, end_col).each(function () {
    tb_keys.push($(this).attr('id'))
  });

  let tb_data = []; //表格数据
  $('tbody tr').each(function () {
    let row = {};
    for (let i = 0; i < tb_keys.length; i++) {  //根据表头选择表格数据
      let child = $($(this).children('td')[i]).children() //child=select or input or others...
      let child_tag = child[0].tagName   //根据子元素标签名决定取值方式
      if (child_tag === 'SELECT') {
        row[tb_keys[i]] = child.find('option:selected').val()  //seleted option value
      } else if (child_tag === 'INPUT') {
        row[tb_keys[i]] = child.val();  //input value
      } else {
        row[tb_keys[i]] = child.text();  //element text
      }
    }
    tb_data.push(row);
  });
  return tb_data
}

function common_attach(path, target_select, target_id, params) {
  let res = [{'desc':'test'}];
  //项目
  $.ajax({
    type: 'get',
    data: params,
    url: path,
    async: false,
    contentType: 'application/json; charset=utf-8',
    success: function (result, textStatus) {
      auto_select(result, target_select, target_id);
      res = result.retlist;
    },
    error: function () {
      console.log('获取失败');
    },
  });
  return res;
}


function auto_select(result, target_select, target_id) {
  let select_btn = typeof (target_select) === 'string' ? $(target_select) : target_select
  //清除原有option只保留第一个,nth-child(n+2)表示从第二个子元素开始
  select_btn.children('option:nth-child(n+2)').remove()
  let items = result.retlist;
  for (const item of items) {
    //选项文本选择顺序：名称？描述？用户名
    let option_txt = item.name ? item.name : item.desc ? item.desc : item.username ? item.username : item.file_path

    //渲染列表选项
    select_btn.append($('<option></option>').val(item.id).text(option_txt));
  }
  //判断是否自动更新，如果传递了target_id则遍历选项id找出和其相等的自动选中
  if (target_id) {
    //查看默认选项
    select_btn.children('option').each(function () {
      if ($(this).val() == target_id) {
        $(this).attr('selected', '');
      }
    });
  }
}

function update_select(target, data, url) {
  $.ajax({
    type: 'get',
    data: data,
    url: url,
    contentType: 'application/json; charset=utf-8',
    success: function (result, TextStatus) {
      attach_select(target, result.retlist);
    },
    error: function () {
      console.log('获取失败');
    },
  })
}

//select选项关联
function attach_select(target_select, items) {
  let select_btn = $(target_select)
  //清除原有option只保留第一个,nth-child(n+2)表示从第二个子元素开始
  select_btn.children('option:nth-child(n+2)').remove()
  for (const item of items) {
    //渲染列表选项
    select_btn.append($('<option></option>').val(item.id).text(item.name ? item.name : item.desc));
  }
}

//select选择监听
function select_onchange(source, target, url,) {
  //监听源
  $(source).change(function () {
    //选中项--value 对应数据的id
    let selected = $(this).children('option:selected').val();
    //动态更新目标select
    update_select(target, {'project_id': selected}, url);
  })
}


//序号重排
function resort_stepNO() {
  let num = 1;
  $('tbody td:nth-child(1)>h5').each(function () {
    $(this).text(num);
    num += 1;
  });
}

//新增一行
function new_line() {
  $('.card-footer>.btn-warning').bind('click', function () {
    //拷贝最后一行
    let tr = $('.card-footer tbody tr:nth-last-child(1)');
    let num = tr.find('td>h5').text(); //取出序号
    num = parseInt(num) + 1  //序号自增
    let line_new = tr;
    line_new.find('td>h5').text(num); //自增的ID回写HTML
    $('.card-footer tbody').append(line_new[0].outerHTML);
  })
}

//删除一行
function delete_line(target) {
  if ($('.card-footer tbody tr').length > 1) {
    //console.log($(target).html());
    const res = $(target).parent().parent().remove();
    resort_caseNO(); //删除后序号重排
  } else {
    alert('至少保留一行');
  }
}

function multiple_select_attach(path, target_select, targets, params) {
  $.ajax({
    type: 'get',
    data: params,
    url: path,
    async: true,
    contentType: 'application/json; charset=utf-8',
    success: function (result, textStatus) {
      let select_btn = typeof (target_select) === 'string' ? $(target_select) : target_select
      select_btn.children('option').remove();
      let items = result.retlist;
      for (const item of items) {
        //选项文本选择顺序：名称？描述？用户名
        let option_txt = item.name ? item.name : item.desc ? item.desc : item.username
        //渲染列表选项
        select_btn.append($('<option></option>').val(item.id).text(option_txt));
      }
      //判断是否自动更新，如果传递了target_id则遍历选项id找出和其相等的自动选中
      if (targets) {
        for (let target_id in targets) {
          select_btn.children('option').each(function () {
            if ($(this).val() == target_id) {
              $(this).attr('selected', '');
            }
          });
        }
      }
    },
    error: function () {
      console.log('获取失败')
    },
  });
}

function multiple_checked_box(path, target_select, targets, params) {
  $.ajax({
    type: 'get',
    data: params,
    url: path,
    async: true,
    contentType: 'application/json; charset=utf-8',
    success: function (result, textStatus) {
      let check_box = typeof (target_select) === 'string' ? $(target_select) : target_select
      check_box.children('div').remove(); //先清空
      let items = result.retlist;
      for (const item of items) {
        let check_item = '<div class="form-check form-check-inline mr-1"></div>'

        let input_check = '<input class="form-check-input" id="inline-checkbox1" type="checkbox" >'
        let node1 = $(input_check).attr('id', item.id);

        let label_txt = '<label class="form-check-label" for="inline-checkbox1">One</label>\n'
        let node2 = $(label_txt).attr('for', item.id).text(item.username);

        $(check_item).append($(node1)[0]).append($(node2)[0]);
        //追加
        check_box.append($(check_item).append($(node1)[0]).append($(node2)[0]));
      }
      //判断是否自动更新，如果传递了target_id则遍历选项id找出和其相等的自动选中
      if (targets) {
        for (let target_id in targets) {
          select_btn.children('option').each(function () {
            if ($(this).val() == target_id) {
              $(this).attr('selected', '');
            }
          });
        }
      }
    },
    error: function () {
      console.log('获取失败')
    },
  });
}

function target_selected(target_select, target_id) {
  let select_btn = $(target_select);
  let tar = target_id.toString()
  if (tar) {
    //查看默认选项
    select_btn.children('option').each(function () {
      if ($(this).val() === tar) {
        $(this).attr('selected', '');
      }
    });
  }
}

//退出
function do_logout() {
  $.ajax({
    type: 'get',
    url: '/api/logout/',
    contentType: 'application/json; charset=utf-8',
    statusCode: {
      302: function (result) {
        window.location.href = result.responseJSON.to
      }
    },
    error: function (result) {
      handler_alert('#error_service', result.responseJSON.msg);
    }
  })
}

function common_delete(_id, url) {
  const csrftoken = getCookie('csrftoken');
  $.ajax({
    type: 'delete',
    url: `${url}${_id}/`,
    contentType: 'application/json; charset=utf-8',
    headers: {'X-CSRFToken': csrftoken},
    success: function (result, textStatus) {
      if (result.retcode === 200) {
        $('#res_table').bootstrapTable('refresh'); //刷新
      } else if (result.retcode === 403) {
        console.log('没有权限');
        location.href = result.to;
      }
    },
    error: function () {
      alert('服务器错误');
    }
  });
}

function redirectHandle(xhr) {
  let result = xhr.responseJSON
  if (result.retcode === 403 && result.to) {
    console.log('检测到未登录，进行重定向')
    window.location.href = result.to
  }
}

$(function () {
  $(document).ajaxComplete(function (event, xhr, settings) {
    // 这里处理静态页面重定向，API由后端进行过滤
    // 过滤掉不需要登录信息的页面
    pre_pages = ['/login.html', '/register.html'];
    if (pre_pages.indexOf(window.location.pathname) === -1) {
      redirectHandle(xhr);
    }
  })
})


$(document).ready(
  current_user(), //查看当前用户信息，顺便检测登录状态

  //绑定登出
  $('.dropdown-menu-right a:nth-last-child(1)').click(function () {
    console.log('检测用户登出');
    do_logout();
  }),
)


function requestHandler(params) {
  return {
    page_size: $(".page-size").text().trim(),
    page_index: $(".pagination>.active").text() ? $(".pagination>.active").text() : 1,
  };
}

function responseHandler(res) {
  return {
    'rows': res.retlist,
    'total': res.total,
  }
}

//表格超出宽度鼠标悬停显示td内容
function paramsMatter(value, row, index) {
  let span = document.createElement("span");
  span.setAttribute("title", JSON.stringify(value));
  span.innerHTML = JSON.stringify(value);
  return span.outerHTML;
}

//td宽度以及内容超过宽度隐藏
function formatTableUnit(value, row, index) {
  return {
    css: {
      "white-space": "nowrap",
      "text-overflow": "ellipsis",
      "overflow": "hidden",
      "max-width": "100px"
    }
  }
}


function auto_table(url, columns) {
  $('#res_table').bootstrapTable({
    method: 'get',
    url: url, // 请求路径
    striped: true, // 是否显示行间隔色
    pageNumber: 1, // 初始化加载第一页
    pagination: true, // 是否分页
    paginationPreText: 'Prev', //上一个按钮文本。
    paginationNextText: 'Next',//下一个按钮文本。
    paginationDetailHAlign: 'right',
    paginationHAlign: 'left',
    sidePagination: 'server', // server:服务器端分页|client：前端分页

    multipleSelectRow: true, //设置true以启用多选行
    undefinedText: 'N/A',  //定义默认undefined 文本。
    pageSize: 5, // 默认单页记录数
    pageList: [5, 10, 15],  //可以选择的单页记录数
    showColumns: false,	//选列的下拉菜单
    showRefresh: false,	//刷新按钮
    showToggle: false,	//视图切换
    search: false,
    toolbarAlign: 'left',	//自定义按钮位置
    queryParams: requestHandler, // 上传服务器的参数
    responseHandler: responseHandler, // 服务器响应接收

    columns: columns,
    clickToSelect: true,  //单击行时选择复选框或单选框
  });
}

function detail_view_talbe(table, values, columns, default_values) {
  $(table).bootstrapTable({
    data: values !== [] ? values : default_values,   // 要展示的数据
    striped: true, // 是否显示行间隔色
    pageNumber: 1, // 初始化加载第一页
    pagination: true, // 是否分页
    paginationPreText: 'Prev', //上一个按钮文本。
    paginationNextText: 'Next',//下一个按钮文本。
    paginationDetailHAlign: 'right',
    paginationHAlign: 'left',
    sidePagination: 'client', // server:服务器端分页|client：前端分页
    multipleSelectRow: true, //设置true以启用多选行
    pageSize: 5, // 默认单页记录数
    pageList: [5, 10, 15],  //可以选择的单页记录数

    toolbarAlign: 'left',	//自定义按钮位置
    // queryParams: requestHandler, // 上传服务器的参数
    // responseHandler: responseHandler, // 服务器响应接收
    columns: columns,
    clickToSelect: true,  //单击行时选择复选框或单选框
    // onClickCell: collect_data,
  });
  $(table).bootstrapTable('hideLoading');
}

function collect_data(field, value, row, $element) {
  let target_ele = $element.find('textarea');
  target_ele.one('blur', function () {
    let index = row.sorted_no;
    let tdValue = target_ele.val();
    saveData(index, field, tdValue);
    //jquery删除对象属性
    target_ele.unbind('blur');
  });

}

function saveData(index, field, value) {
  $('#detail_view').bootstrapTable('updateCell', {
    index: index,       //行索引
    field: field,       //列名
    value: value        //cell值
  });
}

function editFormatter(value, row, index) {
  let content = row;
  if (row.hasOwnProperty('step_content')) {
    content = row.step_content;
  }
  return [
    '<div class="col-md-10">\n' +
    '<textarea class="form-control" type="text" name="step" >' +
    JSON.stringify(row, null, 4) +
    '</textarea>\n' +
    '</div>'
  ].join("");
}
