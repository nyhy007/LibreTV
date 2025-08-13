<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>密码保护页面</title>
  <script>
    // 设置密码哈希
    window.__ENV__ = {
      PASSWORD: "69fb2ee18ab9ebb22521c2675d1e3df2eb603a09348dc1406cb580b1edbbf4b5"
    };

    // 计算 SHA-256
    async function sha256(message) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 验证密码
    async function verifyPassword() {
      const pwd = prompt("请输入访问密码：");
      if (!pwd) {
        document.body.innerHTML = "<h1>拒绝访问</h1>";
        return;
      }
      const hash = await sha256(pwd);
      if (hash === window.__ENV__.PASSWORD) {
        // 密码正确才插入内容
        document.body.innerHTML = `
          <h1>这是内容区</h1>
          <p>只有输入正确密码才能看到的内容。</p>
        `;
      } else {
        document.body.innerHTML = "<h1>密码错误</h1>";
      }
    }

    window.onload = verifyPassword;
  </script>
</head>
<body>
  <!-- 页面初始为空，等待密码验证 -->
</body>
</html>
