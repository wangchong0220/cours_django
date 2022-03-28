function sync_case() {
  console.log('同步jira 用例信息')
  $.ajax({
    type: 'get',
    url: '/jira/sync/case/',
    dataType: 'json',
    success: function(result,TextStatus){
      if(result.retcode===200){
        // 消除蒙层,为了生效延迟1秒执行
        setInterval(function () {
          $('#syncCase').click()
        },1000)
      }else if(result.retcode===403){
        console.log('未登录,开始重定向')
        location.href = result.to
      }
    },
    error: function (){
      $('#syncCase').click()
      console.log('同步失败，消除蒙层')
    },
  })
}

function case_view(_id) {
  $.ajax({
    type: 'get',
    url: '/jira/list/case/',
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
        $('p[title="creator"]').text(item.creator);
        $('p[title="created"]').text(item.created);
        $('p[title="updated"]').text(item.updated);
        $('p[title="labels"]').text(item.labels);
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

function addFunctionAlty(value, row, index) {
  return [
    `<a id="edit" class="btn btn-pill btn-sm btn-info" href="jira_case_view.html?_id=${row.id}">查看</a>`,
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
  title: '创建人',
  field: 'creator',
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
  title: '标签',
  field: 'labels',
  visible: false,
},{
  title: '操作',
  formatter: addFunctionAlty//表格中增加按钮
}
]