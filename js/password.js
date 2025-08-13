export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cookie = request.headers.get("Cookie") || "";

    // 已经通过验证
    if (cookie.includes("auth_pass=true")) {
      return fetch(request);
    }

    // 检查是否是表单提交
    if (request.method === "POST") {
      const formData = await request.formData();
      const password = formData.get("password");

      // 从环境变量读取密码
      const correctPassword = env.PASSWORD; 

      if (password === correctPassword) {
        return new Response(null, {
          status: 302,
          headers: {
            "Set-Cookie": "auth_pass=true; Path=/; HttpOnly; Max-Age=3600",
            "Location": url.pathname,
          },
        });
      } else {
        return new Response("密码错误", { status: 401 });
      }
    }

    // 返回密码输入页面
    return new Response(`
      <html>
        <head>
          <title>请输入密码</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding-top: 100px; }
            input { padding: 10px; font-size: 16px; }
            button { padding: 10px 20px; font-size: 16px; }
          </style>
        </head>
        <body>
          <form method="POST">
            <input type="password" name="password" placeholder="输入密码" required />
            <button type="submit">进入</button>
          </form>
        </body>
      </html>
    `, { headers: { "Content-Type": "text/html" } });
  }
}
