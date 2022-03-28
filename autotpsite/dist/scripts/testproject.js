

//列出项目
function list_project(params){
    $.ajax({
        type: 'get',
        data: params,
        url: '/api/projects/',
        contentType: 'application/json; charset=utf-8',
        success: function(result,TextStatus){
            if(result.retcode===200){
                repaint_projectlist(result);
            }else if(result.retcode===403){
                console.log('未登录,开始重定向')
                location.href = result.to
            }
        },
        error: function (){
            console('获取失败')
        },
    })
}
function repaint_projectlist(result){
    retlist = result.retlist;
    //先删除列表现有内容
    $('.card-body tbody tr').remove()
    //添加新的内容
    if(retlist.length>0){
        for (const res of retlist) {
            let tr = $('<tr></tr>')
            //创建行内容
            tr.append($('<td></td>').text(res.id),
                $('<td></td>').text(res.name),
                $('<td></td>').text(res.desc),
                $('<td></td>').append($('<span></span>').text(res.status).addClass('badge badge-pill badge-success')),
                $('<td></td>').text(res.create_time),
                $('<td></td>').text(res.update_time),
                $('<td></td>').text(res.admin?res.admin.username:'N/A'),
                $('<td></td>').text(res.version),
                $('<td></td>').append($('<a></a>').text('编辑').addClass('btn btn-pill btn-sm btn-info').attr('href',`project_view.html?pro_id=${res.id}`),
                    $('<button></button>').text('删除').addClass('btn btn-pill btn-sm btn-danger').attr('data-toggle',"modal").click(function () {
                        delete_project(res.id)
                        //.attr('data-target',"#deleteProject")
                    })),
            );

            $('.card-body tbody').append(tr) //添加数据
        }
    }
}

//新增测试项目表单
function attach_project(params){
    //管理员
    common_attach('/api/users/','[name="admin_id"]');

}

//保存项目按钮
function new_project(){
    const csrftoken = getCookie('csrftoken'); //从cookie获取django的crsftoken
    //获取信息
    let status = $('[name="status"] option:selected').val();
    let admin_id = $('[name="admin_id"] option:selected').val();
    let name = $('[name="name"]').val();
    let desc= $('[name="desc"]').val();
    let version = $('[name="version"]').val();
    //提交
    $.ajax({
        type: 'post',
        data: JSON.stringify({'status':status,'desc':desc,'name':name,'admin_id':admin_id,'version':version,}),
        url: '/api/projects/',
        cache: false,
        contentType: 'application/json; charset=utf-8',
        headers: {'X-CSRFToken': csrftoken},
        success: function (result,TextStatus){
            console.log('success');
            $('[data-dismiss="modal"]').click();
            console.log(result);
            list_project(); //重新列出测试计划
        },
        error:function (result,TextStatus){
            console.log('fail');
            $('[data-dismiss="modal"]').click();
            console.log(result);
        },
    })
}

//监听提示框按钮
function on_listen_choice(_id){
    //如果点击取消，取消删除按钮监听
    $('#deleteProject [data-dismiss="modal"]').click(
      function (){
          console.log($(this).text());
          // 移除监听
          $(this).off('click');
      }
    )
    //如果点击删除，则触发删除项目
    $('#deleteProject .btn-danger').click(
      function (){
          delete_project(_id);
      }
    );
}

//删除项目按钮
function delete_project(_id){
    return common_delete(_id,'/api/projects/')
}


//plan详情页面
function project_view(pro_id){
    $.ajax({
        type: 'get',
        data: {'id':pro_id},
        url: '/api/projects/',
        contentType: 'application/json; charset=utf-8',
        success:function (result, textStatus) {
            let project = result.retlist[0];
            $('input[name="name"]').val(project.name);
            $('input[name="desc"]').val(project.desc);
            $('input[name="version"]').val(project.version);
            $('p[title="admin"]').text(project.admin.username);
            //状态
            target_selected('select[name="status"]',project.status)
            //成员
            //multiple_select_attach('/api/user/list/','select[name="members"]','')
            //multiple_checked_box('/api/user/list/','#members')
            let mems = [];
            for(const m of project.members){
                mems.push(m.username)
            }
            $('p[title="members"]').text(mems.join(' , '));
            //拷贝1行模板
            let row_temp = $('.card-footer tbody tr:nth-last-child(1)');
            //模块刷新
            if (project.modules.length > 0) {
                //删除所有行
                $('.card-footer tbody tr').each(function (){
                    $(this).remove();
                });
                for (let module of project.modules) {
                    //新增一行
                    $('.card-footer tbody').append(row_temp[0].outerHTML);
                    //填充id
                    $('.card-footer tbody tr:nth-last-child(1) span').attr('title',module.id)
                    //填充名称
                    $('.card-footer tbody tr:nth-last-child(1) input[name="module_name"]').val(module.name);
                    //填充描述
                    $('.card-footer tbody tr:nth-last-child(1) input[name="module_desc"]').val(module.desc);

                }
            } else {
                //更新用例下拉
            }

        },
        error:function (){
            console.log('没找到哦');
        }
    });
    //绑定修改按钮点击方法---提交修改
    $('[type="submit"]').click(function () {
        update_project(pro_id);
    })
}
//提交修改
function update_project(_id) {
    const csrftoken = getCookie('csrftoken'); //从cookie获取django的crsftoken
    //获取信息
    const name = $('input[name="name"]').val();
    const desc = $('input[name="desc"]').val();
    const status = $('select[name="status"] option:selected').val();
    const version = $('input[name="version"]').val();
    //提交信息
    $.ajax({
        type: 'put',
        data: JSON.stringify({'name':name,'desc':desc,'status':status,'version':version}),
        url: `/api/projects/${_id}/`,
        contentType: 'application/json; charset=utf-8',
        headers: {'X-CSRFToken': csrftoken},
        success: function (result,TextStatus){
            console.log('success')
            //返回列表页面
            window.location.href='projects.html'
        },
        error:function (result,TextStatus){
            console.log('fail'+result.msg)
        },
    });
    //绑定修改按钮点击方法---提交修改
}


//保存模块module
function save_module(target,project_id){
    const csrftoken = getCookie('csrftoken');
    //逻辑--如果存在就发送修改请求，如果不存在，就发送创建请求
    let _id = $(target).parent().parent().find('td:nth-child(1) span').attr('title');
    let module_name = $(target).parent().parent().find('[name="module_name"]').val();
    let module_desc = $(target).parent().parent().find('[name="module_desc"]').val();
    if(_id){
        console.log('修改模块');
        $.ajax({
            type: 'put',
            data: JSON.stringify({'name':module_name,'desc':module_desc,'project_id':project_id}),
            url: '/api/module/?id='+_id,
            contentType: 'application/json; charset=utf-8',
            headers: {'X-CSRFToken': csrftoken},
            success: function (result,TextStatus){
                console.log('success')
            },
            error:function (result,TextStatus){
                console.log('fail'+result.msg)
            },
        })
    }else{
        console.log('创建模块');
        $.ajax({
            type: 'post',
            data: JSON.stringify({'name':module_name,'desc':module_desc,'project_id':project_id}),
            url: '/api/module/',
            cache: false,
            contentType: 'application/json; charset=utf-8',
            headers: {'X-CSRFToken': csrftoken},
            success: function (result,TextStatus){
                //回写ID
                $(target).parent().parent().find('td:nth-child(1) span').attr('title',result.id)
                //再新增1行
                module_new_line();
            },
            error:function (result,TextStatus){
                console.log('fail'+result.msg);
            },
        })
    }
}

//删除模块
function delete_module(target) {
    const csrftoken = getCookie('csrftoken')
    let _id = $(target).parent().parent().find('td:nth-child(1) span').attr('title');
    $.ajax({
        type: 'delete',
        data: {},
        url: '/api/module/?id='+_id,
        contentType: 'application/json; charset=utf-8',
        headers: {'X-CSRFToken': csrftoken},
        success: function (result,TextStatus){
            //判断请求的retcode
            let retcode = result.retcode
            if(retcode===200){
                //删除该行
                $(target).parent().parent().remove();
            }else{
                console.log('删除失败');
            }
        },
        error:function (result,TextStatus){
            console.log('fail'+result.msg);
        },
    })
}

function module_new_line() {
    let empty_line = '<tr>\n' +
      '                  <td><h5>1<span title></span></h5></td>\n' +
      '                  <td><input class="form-control" type="text" name="module_name" placeholder="模块名称"></td>\n' +
      '\n' +
      '                  <td><input class="form-control" type="text" name="module_desc" placeholder="模块描述"></td>\n' +
      '                  <td>\n' +
      '                      <button class="btn btn-pill btn-sm btn-outline-info" onclick="save_module(this,getUrlParam(\'pro_id\'))"> 保存</button>\n' +
      '                      <button class="btn btn-pill btn-sm btn-outline-danger" onclick="delete_module(this)"> 删除</button>\n' +
      '                  </td>\n' +
      '                </tr>'
    $('.card-footer tbody').append(empty_line);
}

function addFunctionAlty(value, row, index) {
    return [
        `<a id="edit" class="btn btn-pill btn-sm btn-info" href="project_view.html?pro_id=${row.id}">查看</a>`,
        '<button id="delete" class="btn btn-pill btn-sm btn-danger" data-toggle="modal" data-target="#delete_modal">删除</button>',
    ].join('');
}

let operateEvents = {
    'click #edit': function (e, value, row, index) {
    },'click #delete': function (e, value, row, index) {
        function to_delete_item() {
            console.log('delete,row: '+row.id);
            delete_project(row.id);
        }
        $('.modal-footer .btn-danger').unbind('click').click(to_delete_item);
    },
};

const columns=[{
    checkbox: true
},{
    title: 'ID',
    field: 'id',
    //visible: false
}, {
    title: '名称',
    field: 'name',
},{
    title: '状态',
    field: 'status',
    formatter:parse_status,
},{
    title: '创建时间',
    field: 'create_time',
    cellStyle: formatTableUnit,
    formatter: paramsMatter,
},{
    title: '更新时间',
    field: 'update_time',
    cellStyle: formatTableUnit,
    formatter: paramsMatter,
},{
    title: '管理员',
    field: 'admin.username',
},{
    title: '版本',
    field: 'version',
},{
    title: '操作',
    events: operateEvents,//给按钮注册事件
    formatter: addFunctionAlty//表格中增加按钮
}
]

function parse_status(value, row, index) {
    let span = $('<span></span>').addClass('badge')
    if(value==='stable'){
        span.addClass('badge-success').text(value)
    }else {
        span.addClass('badge-dark').text(value)
    }
    return span.prop("outerHTML")  //返回html内容
}
