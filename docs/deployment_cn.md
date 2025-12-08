# 部署指南

这份指南专为初学者准备。别担心，你不需要懂复杂的服务器配置，只需要跟着下面的步骤，就能轻松把你的个人主页发布上线！

## 方案一：GitHub Pages

如果你没有设置 GitHub Pages 的先验知识，那么参考下面第一个方法进行设置

### 本地构建并上传

1.  **构建你的项目**

    首先，请确保你安装了正确的 Node.js 版本。
    *   **下载与安装**：请前往 [https://nodejs.org/en/download](https://nodejs.org/en/download) 手动下载并安装。
    *   最好不要使用系统自带的 Node.js 版本，以免出现兼容性问题。

    打开终端，进入项目文件夹，运行以下命令：

    ```bash
    npm install
    npm run build
    ```

    运行完成后，你会发现在项目目录下多了一个名为 `out` 的文件夹。这里面就是你网站的所有静态文件。

2.  **创建一个 GitHub 仓库**

    *   登录 GitHub。
    *   新建一个 **Public** (公开) 仓库。
    *   **关键步骤**：仓库名必须填 `你的用户名.github.io` (请将 `你的用户名` 替换为你实际的 GitHub 账号名)。

3.  **上传文件**

    *   将 `out` 文件夹里 **所有的内容** 上传到这个新仓库。
    *   你可以在 GitHub 仓库页面点击 "Upload files"，然后把 `out` 文件夹里的所有文件全选拖进去。
    *   *当然，如果你熟悉 Git 命令，也可以直接把 `out` 目录的内容 push 到仓库里。*

4.  **添加 .nojekyll 文件（重要）**

    *   在你的 GitHub 仓库页面，点击 "Add file" -> "Create new file"。
    *   文件名填写 `.nojekyll` (注意前面有个点，且全小写)。
    *   文件内容留空即可，直接点击 "Commit changes"。
    *   *这一步非常重要！它告诉 GitHub 不要忽略以下划线开头的文件夹（比如 Next.js 生成的 `_next`），否则网站样式会加载失败。*

5.  **配置 Pages**

    *   进入仓库的 **Settings** (设置)。
    *   在左侧栏找到 **Pages**。
    *   在 **Build and deployment** 下，确保来源选择的是 "Deploy from a branch"。
    *   选择你的分支（通常是 `main`），然后点击 **Save**。

6.  **大功告成！**
    访问 `https://你的用户名.github.io`，欣赏你的新网站吧！

---

### GitHub Actions 构建

1. **Fork 本仓库**

    点击本仓库右上角的 `Fork`，将 `Fork` 的仓库名称更换为 `你的用户名.github.io`

2. **克隆仓库**

    在命令行输入命令 `git clone git@github.com:你的用户名/你的用户名.github.io.git` 将你的仓库克隆到本地
    
    接着，输入 `git branch publish && git checkout publish` 切换到 `publish` 分支

    你的所有更改都需要在 `publish` 分支下做

3. **设置 Github Pages**

    *   进入仓库的 **Settings** (设置)。
    *   在左侧栏找到 **Pages**。
    *   在 **Build and deployment** 下，确保来源选择的是 "Github Actions"。

4. **大功告成**

    当你在本地的 `publish` 分支下做完任何修改后，按照提交远程仓库的方式：

    ```bash
    git add .
    git commit -am "update message"
    git push --set-upstream origin publish
    ```
    进行提交，随后 Github Actions 会自动触发构建，并部署你的 GitHub Pages
    
    访问 `https://你的用户名.github.io`，欣赏你的新网站吧！ 

---

## 方案二：Cloudflare Pages

1.  **构建项目**
    同样地，先运行 `npm run build`，生成 `out` 文件夹。

2.  **创建应用**
    *   登录 [Cloudflare 控制台 (Dashboard)](https://dash.cloudflare.com/)。
    *   点击左侧的 **Workers & Pages** -> **Create Application**。
    *   选择 **Pages** 标签页。
    *   点击 **Drag and drop your files**。

3.  **上传与发布**
    *   输入 **Project name** (项目名称)，这将成为你域名的前缀（例如：`my-site`）。
    *   点击 **Create project**。
    *   将你的 `out` 文件夹（或者它的压缩包）直接拖入上传区域。
    *   点击 **Deploy**。

4.  **完成！**
    你的网站已经在 `https://<你的项目名>.pages.dev` 上线啦！