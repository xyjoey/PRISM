# Deployment Guide

This guide is designed for beginners. You don't need complex configurations to deploy your website.

## Option 1: GitHub Pages

### Build in Local And Upload to GitHub

1.  **Build your project**
    
    First, ensure you have the correct Node.js version installed.
    *   **Download & Install**: Go to [https://nodejs.org/en/download](https://nodejs.org/en/download) and install Node.js manually.
    *   Better not to use the system's default Node.js as it might be outdated.

    Open your terminal in the project folder and run:
    
    ```bash
    npm install
    npm run build
    ```
    This will create a folder named `out` in your project directory. This folder contains your generated website.
    
2.  **Create a GitHub Repository**
    *   Log in to GitHub.
    *   Create a new **Public** repository.
    *   Name it `username.github.io` (replace `username` with your actual GitHub username).

3.  **Upload Files**
  
    *   Upload **all the files inside the `out` folder** to your new repository.
    *   You can do this by clicking "Upload files" on the GitHub repository page and dragging everything from the `out` folder.
    *   *Alternatively, if you know Git, you can push the contents of `out` to the repository.*
    
4.  **Add .nojekyll file**
  
    *   In your GitHub repository, click "Add file" -> "Create new file".
    *   Name the file `.nojekyll` (start with a dot, all lowercase).
    *   Leave the content empty and click "Commit changes".
    *   *This is important! It tells GitHub to allow folders starting with `_` (like `_next`).*
    
5.  **Configure Pages**
    *   Go to your repository **Settings**.
    *   Click on **Pages** in the left sidebar.
    *   Under **Build and deployment**, ensure "Deploy from a branch" is selected.
    *   Select your branch (usually `main`) and click **Save**.

6.  **Done!**
    Visit `https://username.github.io` to see your website.

---

### Using GitHub Actions

This guide will walk you through setting up your new website using **GitHub Pages** and **GitHub Actions**.

1. **Fork the Repository**

  * Click the **`Fork`** button located in the upper-right corner of this repository.
  * When prompted to change the repository name, rename the forked repository to `your-username.github.io`.
    > *For example, if your GitHub username is `octocat`, the repository name should be `octocat.github.io`.*

2.  **Clone the Repository Locally**

  * Open your command line/terminal.
  * Clone your new repository to your local computer:
    ```bash
    git clone git@github.com:your-username/your-username.github.io.git
    ```
  * Next, enter these commands to create and switch to the correct branch:
    ```bash
    git branch publish
    git checkout publish
    ```
    > [!NOTE]
    >
    > All of your website changes must be made within the **`publish`** branch.

3.  **Set Up GitHub Pages**

  * Go to your new repository on GitHub and click on **Settings**.
  * In the left sidebar, click on **Pages**.
  * Under the **"Build and deployment"** section, make sure the **Source** is set to "**GitHub Actions**".

4. **You're All Set**

Once you have made any changes on the local **`publish`** branch, follow the standard Git process to commit and push your changes to the remote repository:

```bash
git add .
git commit -am "update message"
git push --set-upstream origin publish
```

After you push, **GitHub Actions** will automatically start the build process and deploy your files to **GitHub Pages**.

You can now visit your new website at `https://your-username.github.io` .

----

## Option 2: Cloudflare Pages

1.  **Build your project**
    Run `npm run build` to generate the `out` folder.

2.  **Create Application**
    *   Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
    *   Go to **Workers & Pages** -> **Create Application**.
    *   Select the **Pages** tab.
    *   Click **Drag and drop your files**.

3.  **Upload**
    *   Enter a **Project name** (this will be your subdomain, e.g., `my-site`).
    *   Click **Create project**.
    *   Drag and drop your `out` folder (or a zip archive of it) into the upload area.
    *   Click **Deploy**.

4.  **Done!**
    You will see your site live at `https://<project-name>.pages.dev`.
