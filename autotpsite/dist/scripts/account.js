function list_user(params){
    $.ajax({
        type: 'get',
        data: params,
        url: '/api/users/',
        dataType: 'json',
        success: function(result,TextStatus){
            if(result.retcode===200){
                repaint_userlist(result);
            }else if(result.retcode===403){
                //console.log('未登录,开始重定向')
                //location.href = result.to
            }
        },
        error: function (result){
            console.log('获取失败');
        }
    })
}

//重绘页面
function repaint_userlist(result){
    retlist = result.retlist;
    //先删除列表现有内容
    $('.card-body tbody tr').remove()
    //添加新的内容
    if(retlist.length>0){
        for (const res of retlist) {
            let tr = $('<tr></tr>')
            //创建行内容
            tr.append($('<td></td>').text(res.id),
                $('<td></td>').text(res.username),
                $('<td></td>').text(res.email?res.email:'N/A'),
                $('<td></td>').append($('<span></span>').text(res.is_superuser).addClass('badge badge-pill').addClass(res.is_superuser ? 'badge-success':'badge-dark')),
                $('<td></td>').text(res.first_name?res.first_name:'N/A'),
                $('<td></td>').append($('<span></span>').text(res.is_active).addClass('badge').addClass(res.is_active ? 'badge-success':'badge-dark')),
                $('<td></td>').text(res.date_joined),
                $('<td></td>').text(res.last_login),
                $('<td></td>').append($('<a></a>').text('编辑').addClass('btn btn-pill btn-sm btn-info').attr('href',`user_view.html?user_id=${res.id}`),),
            );
            $('.card-body tbody').append(tr) //添加数据
        }
    }
}
function addFunctionAlty(value, row, index) {
    return [
        `<a id="edit" class="btn btn-pill btn-sm btn-info" href="user_view.html?case_id=${row.id}">查看</a>`,
        '<button id="delete" class="btn btn-pill btn-sm btn-danger" data-toggle="modal" data-target="#delete_modal">删除</button>',
    ].join('');
}

let operateEvents = {
    'click #edit': function (e, value, row, index) {
    },'click #delete': function (e, value, row, index) {
        function to_delete_item() {
            console.log('delete,row: '+row.id);
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
    title: '用户名',
    field: 'username',
}, {
    title: '邮箱',
    field: 'email',
    formatter:parse_email,
},{
    title: 'admin',
    field: 'is_superuser',
    formatter:parse_admin,
},{
    title: '手机号',
    field: 'phone',

},{
    title: '状态',
    field: 'is_active',
    formatter:parse_status,
},{
    title: '加入时间',
    field: 'date_joined',
    cellStyle: formatTableUnit,
    formatter: paramsMatter,
},{
    title: '最后登录',
    field: 'last_login',
    cellStyle: formatTableUnit,
    formatter: paramsMatter,
},{
    title: '操作',
    events: operateEvents,//给按钮注册事件
    formatter: addFunctionAlty//表格中增加按钮
}
];

function parse_admin(value, row, index) {
    let span = $('<span></span>').addClass('badge badge-pill')
    if(value){
        span.addClass('badge-success').text('admin')
    }else {
        span.addClass('badge-secondary').text('unknown')
    }
    return span.prop("outerHTML")  //返回html内容
}

function parse_status(value, row, index) {
    let span = $('<span></span>').addClass('badge')
    if(value){
        span.addClass('badge-success').text('active')
    }else {
        span.addClass('badge-dark').text('disable')
    }
    return span.prop("outerHTML")  //返回html内容
}

function parse_email(value, row, index) {
    let a = $('<a></a>').addClass('badge')
    if(value){
        a.text(value).addClass('badge-info').attr('href',value)
    }else {
        a.text('unknown').addClass('badge-secondary')
    }
    return a.prop("outerHTML")  //返回html内容
}

$(document).ready(
  auto_table("/api/users/",columns),
)