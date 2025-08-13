<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>密码保护页面</title>

  <!-- 先注入密码环境变量 -->
  <script>
    window.__ENV__ = {
      PASSWORD: "69fb2ee18ab9ebb22521c2675d1e3df2eb603a09348dc1406cb580b1edbbf4b5", // hy3257780
      ADMINPASSWORD: "0000000000000000000000000000000000000000000000000000000000000000"
    };
  </script>

  <!-- 内嵌你的第一段密码验证代码 -->
  <script>
    // SHA-256 计算函数
    async function sha256(message) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function isPasswordProtected() {
      return window.__ENV__ && window.__ENV__.PASSWORD;
    }

    async function verifyPassword() {
      const userInput = prompt("请输入访问密码：");
      if (!userInput) {
        alert("未输入密码，拒绝访问！");
        location.reload();
        return;
      }
      const hash = await sha256(userInput);
      if (hash === window.__ENV__.PASSWORD) {
        console.log("密码正确，进入网站");
      } else {
        alert("密码错误！");
        location.reload();
      }
    }

    (async () => {
      if (await isPasswordProtected()) {
        await verifyPassword();
      }
    })();
  </script>

</head>
<body>
  <h1>这是内容区</h1>
  <p>只有输入正确密码才能看到这个内容。</p>
</body>
</html>
