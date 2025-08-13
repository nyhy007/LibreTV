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
                : PASSWORD_CONFIG.adminLocalStorageKey;

            localStorage.setItem(storageKey, JSON.stringify({
                verified: true,
                timestamp: Date.now(),
                passwordHash: correctHash
            }));
        }
        return isValid;
    } catch (error) {
        console.error(`验证${passwordType}密码时出错:`, error);
        return false;
    }
}

// 统一验证状态检查
function isVerified(passwordType = 'PASSWORD') {
    try {
        if (!isPasswordProtected()) return true;

        const storageKey = passwordType === 'PASSWORD'
            ? PASSWORD_CONFIG.localStorageKey
            : PASSWORD_CONFIG.adminLocalStorageKey;

        const stored = localStorage.getItem(storageKey);
        if (!stored) return false;

        const { timestamp, passwordHash } = JSON.parse(stored);
        const currentHash = window.__ENV__?.[passwordType];

        return timestamp && passwordHash === currentHash &&
            Date.now() - timestamp < PASSWORD_CONFIG.verificationTTL;
    } catch (error) {
        console.error(`检查${passwordType}验证状态时出错:`, error);
        return false;
    }
}

// 更新全局导出
window.isPasswordProtected = isPasswordProtected;
window.isPasswordVerified = () => isVerified('PASSWORD');
window.isAdminVerified = () => isVerified('ADMINPASSWORD');
window.verifyPassword = verifyPassword;

// SHA-256实现，可用Web Crypto API
async function sha256(message) {
    if (window.crypto && crypto.subtle && crypto.subtle.digest) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // HTTP 下调用原始 js‑sha256
    if (typeof window._jsSha256 === 'function') {
        return window._jsSha256(message);
    }
    throw new Error('No SHA-256 implementation available.');
}

/**
 * 显示密码验证弹窗
 */
function showPasswordModal() {
    const passwordModal = document.getElementById('passwordModal');
    if (passwordModal) {
        // 防止出现豆瓣区域滚动条
        document.getElementById('doubanArea').classList.add('hidden');
        document.getElementById('passwordCancelBtn').classList.add('hidden');

        passwordModal.style.display = 'flex';

        // 确保输入框获取焦点
        setTimeout(() => {
            const passwordInput = document.getElementById('passwordInput');
            if (passwordInput) {
                passwordInput.focus();
            }
        }, 100);
    }
}

/**
 * 隐藏密码验证弹窗
 */
function hidePasswordModal() {
    const passwordModal = document.getElementById('passwordModal');
    if (passwordModal) {
        // 隐藏密码错误提示
        hidePasswordError();

        // 清空密码输入框
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) passwordInput.value = '';

        passwordModal.style.display = 'none';

        // 如果启用豆瓣区域则显示豆瓣区域
        if (localStorage.getItem('doubanEnabled') === 'true') {
            document.getElementById('doubanArea').classList.remove('hidden');
            initDouban();
        }
    }
}

/**
 * 显示密码错误信息
 */
function showPasswordError() {
    const errorElement = document.getElementById('passwordError');
    if (errorElement) {
        errorElement.classList.remove('hidden');
    }
}

/**
 * 隐藏密码错误信息
 */
function hidePasswordError() {
    const errorElement = document.getElementById('passwordError');
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

/**
 * 处理密码提交事件（异步）
 */
async function handlePasswordSubmit() {
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput ? passwordInput.value.trim() : '';
    if (await verifyPassword(password)) {
        hidePasswordModal();

        // 触发密码验证成功事件
        document.dispatchEvent(new CustomEvent('passwordVerified'));
    } else {
        showPasswordError();
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

/**
 * 初始化密码验证系统（需适配异步事件）
 */
// 修改initPasswordProtection函数
function initPasswordProtection() {
    if (!isPasswordProtected()) {
        return;
    }
    
    // 检查是否有普通密码
    const hasNormalPassword = window.__ENV__?.PASSWORD && 
                           window.__ENV__.PASSWORD.length === 64 && 
                           !/^0+$/.test(window.__ENV__.PASSWORD);
    
    // 只有当设置了普通密码且未验证时才显示密码框
    if (hasNormalPassword && !isPasswordVerified()) {
        showPasswordModal();
    }
    
    // 设置按钮事件监听
    const settingsBtn = document.querySelector('[onclick="toggleSettings(event)"]');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
            // 只有当设置了普通密码且未验证时才拦截点击
            if (hasNormalPassword && !isPasswordVerified()) {
                e.preventDefault();
                e.stopPropagation();
                showPasswordModal();
                return;
            }
            
        });
    }
}

// 设置按钮密码框验证
function showAdminPasswordModal() {
    const passwordModal = document.getElementById('passwordModal');
    if (!passwordModal) return;

    // 清空密码输入框
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) passwordInput.value = '';

    // 修改标题为管理员验证
    const title = passwordModal.querySelector('h2');
    if (title) title.textContent = '管理员验证';

    document.getElementById('passwordCancelBtn').classList.remove('hidden');
    passwordModal.style.display = 'flex';

    // 设置表单提交处理
    const form = document.getElementById('passwordForm');
    if (form) {
        form.onsubmit = async function (e) {
            e.preventDefault();
            const password = document.getElementById('passwordInput').value.trim();
            if (await verifyPassword(password, 'ADMINPASSWORD')) {
                passwordModal.style.display = 'none';
                document.getElementById('settingsPanel').classList.add('show');
            } else {
                showPasswordError();
            }
        };
    }
}

// 在页面加载完成后初始化密码保护
document.addEventListener('DOMContentLoaded', function () {
    initPasswordProtection();
});


