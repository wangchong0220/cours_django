//注册
function register(){
    let username = $('input[name="username"]').val().trim();
    let email = $('input[name="email"]').val().trim();
    let password = $('input[name="password"]').val().trim();
    let confirm_psw = $('input[name="confirm_psw"]').val().trim();
    let realname=$('input[name="realname"]').val().trim();
    let phone = $('input[name="phone"]').val().trim();
    let admin_code=$('input[name="admin_code"]').val().trim();

    if(!username || !email || !password){
        return handler_alert('#warning_tips','请填写相关信息');//非空校验
    }
    if(password !== confirm_psw){  //检查两次密码是否输入一致
        return handler_alert('#warning_tips','两次密码输入不一致');
    }
    // if(is_admin !== 'sqtp'){  //验证管理员邀请码
    //     return handler_alert('#error_tips','邀请码不正确');
    // }
    let payload={}
    if(admin_code){
        payload={'username':username,'password':password,'email':email,'realname':realname,'phone':phone,'admin_code':admin_code}
    }else {
        payload ={'username':username,'password':password,'email':email,'realname':realname,'phone':phone}
    }
    const csrftoken = getCookie('csrftoken');
    $.ajax({
        type: 'post',
        data: JSON.stringify(payload),
        url: '/api/register/',
        cache: false,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        headers: {'X-CSRFToken': csrftoken},
        success: function (result,status){
            window.location.href = 'index.html'
        },
        error: function (result){
            error_msg = JSON.stringify(result.responseJSON.error)
            return handler_alert('#error_tips',error_msg);
        },
    })
}

//登录
function doLogin(){
    const csrftoken = getCookie('csrftoken'); //从cookie获取django的crsftoken
    //开始登录
    let username = $('[placeholder="Username"]').val();
    let password = $('[placeholder="Password"]').val();
    if(username==='' || password ===''){
        return handler_alert('#empty_alert','密码不能为空');
    }
    if(getUrlParam('next')){
        var path = '/api/login/?next='+getUrlParam('next')
    }else {
        path = '/api/login/'
    }
    $.ajax({
        type: 'post',
        url: path,
        data:JSON.stringify({'username':username,'password':password}),
        contentType: 'application/json; charset=utf-8',
        headers: {'X-CSRFToken': csrftoken},
        statusCode:{
            302: function (result){
                window.location.href = result.responseJSON.to
            }
        },
        error:function (result){
            handler_alert('#error_service',result.responseJSON.error);
        }
    })
}

