# 抖音云后端服务代码

这是 `chifan-recipes-api` 的 Node/Koa 后端模板，提供小程序会调用的三个接口：

- `POST /recipes`
- `POST /favorites`
- `POST /admin`

这份代码会优先连接抖音云 MongoDB。没有配置 MongoDB 时，会自动退回内存数据，方便本地调试。

当前内置数据已从微信小程序食谱库同步，并适配为抖音小程序字段和本地图片路径。

需要在抖音云配置中心同步这些配置：

```text
DB_MONGODB_ADDRESS
DB_MONGODB_ACCOUNT
DB_MONGODB_PASSWORD
```

可选配置：

```text
DB_MONGODB_DATABASE=chifan_recipes
```

后台演示账号：

```text
admin
ChangeMe123!
```
