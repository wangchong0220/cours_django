# Generated by Django 3.2.7 on 2021-10-30 13:46

import django.contrib.auth.models
import django.contrib.auth.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Case',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file_path', models.CharField(default='demo_case.json', max_length=1000, verbose_name='用例文件路径')),
            ],
            options={
                'verbose_name': '测试用例表',
                'ordering': ['id'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Config',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_time', models.DateTimeField(auto_now_add=True, null=True, verbose_name='创建时间')),
                ('update_time', models.DateTimeField(auto_now=True, verbose_name='更新时间')),
                ('desc', models.TextField(blank=True, null=True, verbose_name='描述')),
                ('name', models.CharField(max_length=128, unique=True, verbose_name='名称')),
                ('base_url', models.CharField(blank=True, max_length=256, null=True, verbose_name='IP/域名')),
                ('variables', models.JSONField(null=True, verbose_name='变量')),
                ('parameters', models.JSONField(null=True, verbose_name='参数')),
                ('export', models.JSONField(null=True, verbose_name='用例返回值')),
                ('verify', models.BooleanField(default=False, verbose_name='https校验')),
            ],
            options={
                'verbose_name': '用例配置表',
                'ordering': ['id'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_time', models.DateTimeField(auto_now_add=True, null=True, verbose_name='创建时间')),
                ('update_time', models.DateTimeField(auto_now=True, verbose_name='更新时间')),
                ('desc', models.TextField(blank=True, null=True, verbose_name='描述')),
                ('name', models.CharField(max_length=32, unique=True, verbose_name='项目名称')),
                ('status', models.CharField(choices=[('developing', '开发中'), ('operating', '维护中'), ('stable', '稳定运行')], default='stable', max_length=32, verbose_name='项目状态')),
                ('version', models.CharField(default='v0.1', max_length=32, verbose_name='项目版本')),
            ],
            options={
                'verbose_name': '项目表',
                'ordering': ['id'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Step',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128, verbose_name='名称')),
                ('variables', models.JSONField(null=True, verbose_name='变量')),
                ('extract', models.JSONField(null=True, verbose_name='请求返回值')),
                ('validate', models.JSONField(null=True, verbose_name='校验项')),
                ('setup_hooks', models.JSONField(null=True, verbose_name='初始化')),
                ('teardown_hooks', models.JSONField(null=True, verbose_name='清除')),
                ('belong_case', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='teststeps', to='sqtp.case')),
                ('linked_case', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='linked_steps', to='sqtp.case')),
            ],
            options={
                'verbose_name': '测试步骤表',
                'ordering': ['id'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Request',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('method', models.SmallIntegerField(choices=[(0, 'GET'), (1, 'POST'), (2, 'PUT'), (3, 'DELETE')], default=0, verbose_name='请求方法')),
                ('url', models.CharField(default='/', max_length=1000, verbose_name='请求路径')),
                ('params', models.JSONField(null=True, verbose_name='url参数')),
                ('headers', models.JSONField(null=True, verbose_name='请求头')),
                ('cookies', models.JSONField(null=True, verbose_name='Cookies')),
                ('data', models.JSONField(null=True, verbose_name='表单参数')),
                ('json', models.JSONField(null=True, verbose_name='json参数')),
                ('step', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='sqtp.step')),
            ],
            options={
                'verbose_name': '请求信息表',
                'ordering': ['id'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Environment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_time', models.DateTimeField(auto_now_add=True, null=True, verbose_name='创建时间')),
                ('update_time', models.DateTimeField(auto_now=True, verbose_name='更新时间')),
                ('desc', models.TextField(blank=True, null=True, verbose_name='描述')),
                ('ip', models.GenericIPAddressField(default='127.0.0.1', verbose_name='IP地址')),
                ('port', models.PositiveSmallIntegerField(default=80, verbose_name='端口号')),
                ('category', models.SmallIntegerField(choices=[(0, 'web服务器'), (1, '数据库服务器')], default=0, verbose_name='服务器类型')),
                ('os', models.SmallIntegerField(choices=[(0, 'windows'), (1, 'Linux')], default=1, verbose_name='服务器操作系统')),
                ('status', models.SmallIntegerField(choices=[(0, 'active'), (1, 'disable')], default=0, verbose_name='服务器状态')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sqtp.project', verbose_name='所属项目')),
            ],
            options={
                'verbose_name': '测试环境',
                'ordering': ['id'],
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='case',
            name='config',
            field=models.OneToOneField(on_delete=django.db.models.deletion.DO_NOTHING, to='sqtp.config'),
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('realname', models.CharField(max_length=32, verbose_name='真实姓名')),
                ('phone', models.CharField(blank=True, max_length=11, null=True, unique=True, verbose_name='手机号')),
                ('user_type', models.SmallIntegerField(choices=[(0, '开发'), (1, '测试'), (2, '运维'), (3, '项目经理')], default=1, verbose_name='用例类型')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.Group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.Permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
    ]
