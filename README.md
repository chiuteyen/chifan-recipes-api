# 抖音云后端服务代码

这是 `chifan-recipes-api` 的 Node/Koa 后端模板，提供小程序会调用的三个接口：

- `POST /recipes`
- `POST /favorites`
- `POST /admin`

目前这份代码先用内存保存数据，适合跑通小程序和云服务调用。注意：服务重启后，后台新增的食谱可能会丢失。正式上线前建议再接数据库。

后台演示账号：

```text
admin
ChangeMe123!
```
