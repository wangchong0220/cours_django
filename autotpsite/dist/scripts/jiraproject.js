function sync_project() {
  console.log('同步jira项目信息');
  $.ajax({
    type: 'get',
    url: '/jira/sync/project/',
    dataType: 'json',
    success: function(result,TextStatus){
      if(result.retcode===200){
        // 消除蒙层
        // 消除蒙层,为了生效延迟1秒执行
        setInterval(function () {
          $('#syncPro').click()
        },1000)
      }else if(result.retcode===403){
        console.log('未登录,开始重定向')
        location.href = result.to;
      }
    },
    error: function (){
      $('#syncPro').click();
      console.log('同步失败，消除蒙层');
    },
  })
}


function pro_view(_id) {
  $.ajax({
    type: 'get',
    url: '/jira/list/project/',
    data: {'_id': _id},
    dataType: 'json',
    success: function(result,TextStatus){
      if(result.retcode==200){
        console.log('查询到数据'+_id);
        let pro = result.retlist[0];
        $('p[title="id"]').text(pro.id);
        $('p[title="key"]').text(pro.key);
        $('input[name="name"]').val(pro.name);
        $('input[name="desc"]').val(pro.description);
        $('p[title="admin"]').text(pro.lead);
        $('p[title="category"]').text(pro.projectTypeKey);
        $('p[title="version"]').text(pro.version?pro.version:'N/A');
        $('.c-switch-input[name="status"]').prop('checked',pro.archived);  //更新状态

      }else if(result.retcode==403){
        console.log('未登录,开始重定向')
        location.href = result.to;
      }
    },
    error: function (){
      console.log('查询失败')
    },
  })
}

function addFunctionAlty(value, row, index) {
  return [
    `<a id="edit" class="btn btn-pill btn-sm btn-info" href="jira_project_view.html?_id=${row.id}">查看</a>`,
  ].join('');
}


const columns= [{
  checkbox: true
},{
  title: 'ID',
  field: 'id',
  visible: false
}, {
  title: 'KEY',
  field: 'key',
},{
  title: '名称',
  field: 'name',
}, {
  title: '描述',
  field: 'description',
  formatter:parse_empty,
}, {
  title: '项目负责人',
  field: 'lead',
},{
  title: '类型',
  field: 'projectTypeKey',
},{
  title: '版本',
  field: 'version',
  formatter:parse_empty,
},{
  title: '是否归档',
  field: 'archived',
  formatter:parse_archived,
},{
  title: '操作',
  formatter: addFunctionAlty//表格中增加按钮
}
]

function parse_empty(value, row, index) {
  let span = $('<span></span>').addClass('badge')
  if(value){
    span.addClass('badge-success').text(value)
  }else {
    span.addClass('badge-dark').text('N/A')
  }
  return span.prop("outerHTML")  //返回html内容
}

function parse_archived(value, row, index) {
  let span = $('<span></span>').addClass('badge badge-pill')
  if(value){
    span.text('是').addClass('badge-info')
  }else {
    span.text('否').addClass('badge-dark')
  }
  return span.prop("outerHTML")  //返回html内容
}