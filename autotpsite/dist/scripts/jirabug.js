function sync_bug() {
  console.log('同步jira 缺陷信息')
  $.ajax({
    type: 'get',
    url: '/jira/sync/bug/',
    dataType: 'json',
    success: function(result,TextStatus){
      if(result.retcode===200){
        // 消除蒙层,为了生效延迟1秒执行
        setInterval(function () {
          $('#syncBug').click()
        },1000)
      }else if(result.retcode===403){
        console.log('未登录,开始重定向')
        location.href = result.to
      }
    },
    error: function (){
      $('#syncBug').click()
      console.log('同步失败，消除蒙层')
    },
  })
}

function attach_jira_pro(){
  //项目
  common_attach('/jira/list/project/','[name="project"]');
}

function bug_view(_id) {
  $.ajax({
    type: 'get',
    url: '/jira/list/bug/',
    data: {'_id': _id},
    dataType: 'json',
    success: function(result,TextStatus){
      if(result.retcode===200){
        console.log('查询到数据'+_id);
        let item = result.retlist[0];
        $('p[title="id"]').text(item.id);
        $('p[title="key"]').text(item.key);
        $('input[name="summary"]').val(item.summary);
        $('input[name="desc"]').val(item.description);
        $('p[title="reporter"]').text(item.reporter);
        $('p[title="created"]').text(item.created);
        $('p[title="updated"]').text(item.updated);
        $('p[title="status"]').text(item.status);
      }else if(result.retcode===403){
        console.log('未登录,开始重定向')
        location.href = result.to;
      }
    },
    error: function (){
      console.log('查询失败')
    },
  })
}

//新建bug
function new_bug() {
  const csrftoken = getCookie('csrftoken');
  //收集数据
  let pro_id = $('select[name="project"] option:selected').val()
  let summary = $('input[name="summary"]').val();
  let desc = $('input[name="desc"]').val();

  $.ajax({
    type: 'post',
    url: '/jira/add/bug/',
    data: JSON.stringify({'pro_id':pro_id,'summary':summary,'description':desc}),
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
    headers: {'X-CSRFToken': csrftoken},
    success: function(result,TextStatus){
      if(result.retcode===200){

        setInterval(function () {
          $('#newBug').click()
        },1000)
      }else if(result.retcode===403){
        console.log('未登录,开始重定向')
        location.href = result.to;
      }
    },
    error: function (){
      console.log('查询失败')
    },
  })
}

function update_bug() {
  const  csrftoken = getCookie('csrftoken')
  //获取信息
  const bug_id = $('p[title="id"]').text();
  const desc = $('input[name="desc"]').val();
  const summary = $('input[name="summary"]').val();
  let kwargs = {'description': desc, 'summary': summary,'bug_id':bug_id}
  //提交信息
  $.ajax({
    type: 'put',
    data: JSON.stringify(kwargs),
    url: '/jira/update/bug/',
    contentType: 'application/json; charset=utf-8',
    headers: {'X-CSRFToken': csrftoken},
    success: function (result, TextStatus) {
      console.log('success');
      //返回bug列表
      window.location.href='jira_bug.html';
    },
    error: function (result, TextStatus) {
      console.log('fail');
    },
  })
}

function addFunctionAlty(value, row, index) {
  return [
    `<a id="edit" class="btn btn-pill btn-sm btn-info" href="jira_bug_view.html?_id=${row.id}">查看</a>`,
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
  title: '主题',
  field: 'summary',
  cellStyle: formatTableUnit,
  formatter: paramsMatter,
}, {
  title: '描述',
  field: 'description',
  cellStyle: formatTableUnit,
  formatter: paramsMatter,
}, {
  title: '报告人',
  field: 'reporter',
},{
  title: '创建时间',
  field: 'created',
  cellStyle: formatTableUnit,
  formatter: paramsMatter,
},{
  title: '更新时间',
  field: 'updated',
  cellStyle: formatTableUnit,
  formatter: paramsMatter,
},{
  title: '所属项目',
  field: 'project_id',
},{
  title: '状态',
  field: 'status',
},{
  title: '操作',
  formatter: addFunctionAlty//表格中增加按钮
}
]

//消除bug