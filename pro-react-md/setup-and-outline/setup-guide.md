# ./pro React Md Setup Guide

## Development Environment Requirements

### Required Software

1. **Code Editor**
   - Visual Studio Code (recommended)
   - Alternative: WebStorm, Atom, or Sublime Text

2. **Runtime Environment**
   - Node.js (LTS version)
   - npm or yarn package manager

3. **Version Control**
   - Git
   - GitHub account (for course repository access)

4. **Browser**
   - Chrome or Firefox (with developer tools)

### Recommended Extensions (VS Code)

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer

## Course Repository Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/chrisminnick/./pro-react-md.git
   cd ./pro-react-md
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Verify Setup**
   ```bash
   npm test
   ```

## Environment Verification

Run the setup test to ensure your environment is properly configured:

```bash
cd setup-test
npm install
npm start
```

You should see a success message indicating your environment is ready.

## Troubleshooting

### Common Issues

1. **Node.js Version**
   - Ensure you're using Node.js LTS version
   - Use nvm to manage Node.js versions if needed

2. **Permission Issues**
   - Avoid using `sudo` with npm
   - Configure npm properly for global packages

3. **Port Conflicts**
   - Default development server runs on port 3000
   - Change port if needed: `PORT=3001 npm start`

### Getting Help

- Check the course repository issues
- Ask questions during class
- Refer to official documentation

## Pre-Course Checklist

- [ ] Code editor installed and configured
- [ ] Node.js and npm installed
- [ ] Git configured with your GitHub account
- [ ] Course repository cloned and setup verified
- [ ] Browser developer tools accessible
- [ ] All required software tested and working

## Course Materials Access

- **Repository**: https://github.com/chrisminnick/./pro-react-md
- **Slides**: Available in course repository
- **Labs**: Individual exercises in labs directory
- **Solutions**: Reference implementations (use responsibly)

## Additional Resources

- Official documentation links
- Community forums and discussion groups
- Recommended reading and tutorials
- Tool-specific guides and references
