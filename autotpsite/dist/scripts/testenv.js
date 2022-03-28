function list_env(params){
    $.ajax({
        type: 'get',
        data: params,
        url: '/api/envs/',
        dataType: 'json',
        success: function(result,TextStatus){
            if(result.retcode===200){
                repaint_envlist(result);
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

//重绘页面
function repaint_envlist(result){
    retlist = result.retlist;
    //先删除列表现有内容
    $('.card-body tbody tr').remove()
    //添加新的内容
    if(retlist.length>0){
        for (const res of retlist) {
            let tr = $('<tr></tr>')
            //创建行内容
            tr.append($('<td></td>').text(res.id),
                $('<td></td>').text(res.desc),
                $('<td></td>').text(res.ip),
                $('<td></td>').text(res.port),
                $('<td></td>').text(res.category),
                $('<td></td>').text(res.os),
                $('<td></td>').text(res.project.name?res.project.name:res.project.desc),
                $('<td></td>').append($('<span></span>').text(res.status).addClass('badge').addClass(res.status ? 'badge-success' : 'badge-dark')),
                $('<td></td>').append($('<a></a>').text('编辑').addClass('btn btn-pill btn-sm btn-info').attr('href',`env_view.html?env_id=${res.id}`),
                ),
            );

            $('.card-body tbody').append(tr) //添加数据
        }
    }
}

//新增测试项目表单
function attach_env(params){
    //项目
    common_attach('/api/projects/','[name="project_id"]');

}

//保存项目按钮
function new_env(){
    const csrftoken = getCookie('csrftoken'); //从cookie获取django的crsftoken
    //获取信息
    let desc= $('[name="desc"]').val();
    let ip = $('[name="ip"]').val();
    let port = $('[name="port"]').val();
    let category = $('[name="category"]').val();
    let os = $('[name="os"]').val();
    let project_id = $('[name="project_id"]').val();
    let status = $('[name="status"] option:selected').val();

    let payload = {'desc':desc,'ip':ip,'port':port,'category':category,'os':os,'project_id':project_id,'status':status}
    //提交
    $.ajax({
        type: 'post',
        data: JSON.stringify(payload),
        url: '/api/envs/',
        cache: false,
        contentType: 'application/json; charset=utf-8',
        headers: {'X-CSRFToken': csrftoken},
        success: function (result,TextStatus){
            $('[data-dismiss="modal"]').click();
            list_env(); //重新列出
        },
        error:function (result,TextStatus){
            console.log('fail');
            $('[data-dismiss="modal"]').click();
        },
    })
}

function env_view(_id) {
    $.ajax({
        type: 'get',
        url: `/api/envs/${_id}/`,
        contentType: 'application/json; charset=utf-8',
        success: function (result, textStatus) {
            if(result.retcode===200){
                paint_env_view(result);
            }else if(result.retcode===403){
                console.log('未登录,开始重定向')
                location.href = result.to
            }
        },
        error: function () {
            console.log('没找到哦');
        }
    });
}

function paint_env_view(result) {
    let env = result.retlist[0];
    $('input[name="desc"]').val(env.desc);  //更新描述
    $('input[name="ip"]').val(env.ip);
    $('input[name="port"]').val(env.port);
    $('.c-switch-input[name="status"]').prop('checked',env.status);  //更新状态
    //更新下拉列表--项目
    common_attach('/api/projects/', 'select[name="project"]', env.project.id);
    //操作系统
    target_selected('select[name="os"]',env.os)
    //类型
    target_selected('select[name="category"]',env.category)
}

function delete_env(_id) {
    return common_delete(_id,'/api/envs/')
}

function addFunctionAlty(value, row, index) {
    return [
        `<a id="edit" class="btn btn-pill btn-sm btn-info" href="env_view.html?env_id=${row.id}">查看</a>`,
        '<button id="delete" class="btn btn-pill btn-sm btn-danger" data-toggle="modal" data-target="#delete_modal">删除</button>',
    ].join('');
}

let operateEvents = {
    'click #edit': function (e, value, row, index) {
    },'click #delete': function (e, value, row, index) {
        function to_delete_item() {
            console.log('delete,row: '+row.id)
            delete_env(row.id)
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
    title: 'IP',
    field: 'ip',
},{
    title: 'PORT',
    field: 'port',
},{
    title: '类型',
    field: 'category',
    formatter: parse_category,
},{
    title: '操作系统',
    field: 'os',
    formatter: parse_os,
},{
    title: '所属项目',
    field: 'project.name',
},{
    title: '描述',
    field: 'desc',
},{
    title: '状态',
    field: 'status',
    formatter:parse_status,
}, {
    title: '操作',
    events: operateEvents,//给按钮注册事件
    formatter: addFunctionAlty//表格中增加按钮
}
];

function parse_status(value, row, index) {
    let span = $('<span></span>').addClass('badge')
    if(value==='active'){
        span.addClass('badge-success').text('可用')
    }else {
        span.addClass('badge-dark').text('禁用')
    }
    return span.prop("outerHTML")  //返回html内容
}

function parse_os(value, row, index) {
    let span = $('<span></span>').addClass('badge')
    if(value==='windows'){
        span.text('windows').addClass('badge-info')
    }else if(value==='linux'){
        span.text('linux').addClass('badge-info')
    }else {
        span.text('unknown').addClass('badge-dark')
    }
    return span.prop("outerHTML")  //返回html内容
}

function parse_category(value, row, index) {
    let span = $('<span></span>').addClass('badge')
    if(value==='web服务器'){
        span.text('web Service').addClass('badge-info')
    }else if(value==='DB服务器'){
        span.text('DB Service').addClass('badge-info')
    }else {
        span.text('unknown').addClass('badge-dark')
    }
    return span.prop("outerHTML")  //返回html内容
}