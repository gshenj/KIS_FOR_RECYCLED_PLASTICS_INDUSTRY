db.roles.insert({
    "role" : "管理员"
})

db.roles.insert({
    "role" : "操作员"
})

db.users.insert({
    "name" : "管理员",
    "role" : "管理员",
    "disabled" : false,
    "__v" : 0,
    "password" : "123"
})

db.configs.insert({
    "company_name" : "苏州元斌塑胶科技有限公司",
    "company_phone" : "0512-65410295",
    "company_address" : "苏州市相城区北桥街道石星路16号",
    "__v" : 0,
    "company_fax" : "0512-65410295",
    "company_logo" : "data:image/png;base64,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ECcptchS9yBNBWVcUdY5IRFyDodF+RCIMN43WC14S3CwFePirEBZFCGUc4SBZphYvBRsEybOMJhYXJgQDQS/7WhpQQxYX/AToUNANDAkUYSqZQLX/fwGWQye72iGikZTkSrLUd+hDExSCIywWPNJlMOlHhMdEfqKJLVMIkOoBRulBNYDT2MTR69vMAqi1DIagrWPuzXmoOk5mj6INbRrUOsqEmXxehDF2WbDJiQCfgo1z5Fqx86+odmF8QCaHU1qUo760PGhYYTIOMRzqAnsqwGTwHA4MgQaJgZGI/ADCDQMhxkjohqkY7B9CGowiaGhIXSadGyxwGCYIj6oGjgNKWASmFiDSxTxyNLyNM4a0iG4WuYLKgAUebG1hpdf/AtatRpGFGlqEV8YDhwNlT0+5/JbvuMJiIFmKytjGiM024IxEDQ1k8gisSWKLQ3t4YWCMRZBSG3mmMYxhI3s5uoohSjJAHAJqCATKp5AwwftCaQQKNBOOOw7ak3BWEfqMoUECnQKQU0wPjgDUQSLDU2Co6YVvtei0ehUQPCUUohkdxi/8uJf8spLfz2twVVvQ59wH7dUJKlUs6cFy/IjlNXH0+bv3ZUnnb8PcOyJgtkNgEphqlTvmk5XvsPsHBgTkySJUvljMF4URcn29vZtz/Pq1lp70gPQ5VxhKuwJSUVV+E9vx54xLj898jm+/0WbiBRKkjiO462trR0AuXz5sv/Nb35zIQiChrUzanye/xv4rOf6P+/3P+1/Ab7o+o8HAAqNaa3N/fv3D69fvz70nnnmmeSVV17ZWVpaogzA41Asvz5uA59XiDIAcqz6/IcGYDZvkiQsLi5y/fp1RClFEATU6/XPnMRaSxzHnzrGGEOapl94U/8foX6f9lnKftKetCftSXvS/hja/wGXkKIw0f6JZAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOC0wNi0yOFQyMjozMTowNiswODowMKi/HFgAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTEtMDUtMThUMjE6NDA6MDArMDg6MDCfphxAAAAAQ3RFWHRzb2Z0d2FyZQAvdXNyL2xvY2FsL2ltYWdlbWFnaWNrL3NoYXJlL2RvYy9JbWFnZU1hZ2ljay03Ly9pbmRleC5odG1svbV5CgAAABh0RVh0VGh1bWI6OkRvY3VtZW50OjpQYWdlcwAxp/+7LwAAABh0RVh0VGh1bWI6OkltYWdlOjpIZWlnaHQAMTI4Q3xBgAAAABd0RVh0VGh1bWI6OkltYWdlOjpXaWR0aAAxMjjQjRHdAAAAGXRFWHRUaHVtYjo6TWltZXR5cGUAaW1hZ2UvcG5nP7JWTgAAABd0RVh0VGh1bWI6Ok1UaW1lADEzMDU3MjYwMDBYDimPAAAAEnRFWHRUaHVtYjo6U2l6ZQAxOTAwMULYKIEJAAAAXnRFWHRUaHVtYjo6VVJJAGZpbGU6Ly8vaG9tZS93d3dyb290L25ld3NpdGUvd3d3LmVhc3lpY29uLm5ldC9jZG4taW1nLmVhc3lpY29uLmNuL3NyYy8yNjMvMjYzNzYucG5nPJ56vwAAAABJRU5ErkJggg=="
})

//db.classifications.insert({"classifications" : []})