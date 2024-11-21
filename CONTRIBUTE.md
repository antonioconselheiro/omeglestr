# Contribute
_working from individuals to individuals_
_against the Beast and his Antichrist_

### Small changes and Bugs
Small changes and bugs should have a Pull Request associated with the open issue (just paste the issue link in the pull request body).

#### Did you find a bug?
You can try to update the library to the last version to see if the bug has already been fixed.

When logging a bug, please be sure to include the following:
 * The library version;
 * If at all possible, an *isolated* way to reproduce the behavior;
 * The behavior you expect to see, and the actual behavior;
 * By pressing F12 you can find some usefull logs that can be attached to the issue;
 * You can include images and gif in the issue.

#### Do not create a duplicate issue
[Search the existing issues](https://github.com/antonioconselheiro/omeglestr/search?type=Issues) before logging a new one.

Some search tips:
 * *Don't* restrict your search to only open issues. An issue with a title similar to yours may have been closed as a duplicate of one with a less-findable title.
 * Check for synonyms. For example, if your bug involves an interface, it likely also occurs with type aliases or classes.

### Feature
No one feature will be implemented without it having an open issue and without which the proposed has been accepted by the team responsible for the project. After the issue is approved, the feature can be implemented.

So you can contribute by proposing features through issues or assigning yourself a task for an approved feature. You can ask for help to implement it, you can take time to deliver your task, nobody will charge you because nobody will pay you.

### Create a Pull Request

Follow the steps:

 * Create a [fork](https://guides.github.com/activities/forking/) from our repository by [clicking here](https://github.com/antonioconselheiro/omeglestr/fork), do a `git clone` of your forked repository and run `devcontainer open .` in the application folder;
 * Create a branch in your forked repository, then code the feature or fix the bug;
 * Run `npm run lint` and `npm run build` in the repository;
 * Create a Pull Request from your repository to this one, with the issue in the body and some information you think could be usefull to the reviewer (with print or a gif of it working);
 * The reviewer can ask some changes, always expect for this and don't be mad when ask changes, this is the process;
 * When you get approved your branch can be merged, if you don't merge it, we will do.

# Tools
## Devcontainer
Run the `.devcontainer/setup.sh` to configure .devcontainer volumes and credentials. Open devcontainer with: `devcontainer open .`

### Environment descriptions
There is a development environment set up in this repository that can be pulled up with docker-compose.
This custom environment is a container [docker](https://docs.docker.com/engine/install/) expressed through a vscode, using the extension [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) from `Microsoft`.
The files for this environment are in the `.devcontainer` folder, where you can see the following customizations:

- In the .devcontainer/Dockerfile, the node image from docker.hub, it is debian;
- with git installed;
- with node installed;
- with keyboard configured for Brazilian Portuguese;
- with America/Sao_Paulo timezone;
- the node tools: husky, eslint, typescript, angular, compodoc, sass-lint and sassdoc;
- In `.devcontainer/devcontainer.json` you can see a set of extensions for vscode libraries and tools used in the project.

### Devcontainer VSCode Extensions
If you contribute code you can suggest including extensions to the development environment vscode and request changes in linter rules.

### Volumes
To start the Docker development environment, ensure that all dependent volumes have been created by running `.devcontainer/setup.sh`. You can verify if the volumes have been mounted successfully by executing the following commands:

Build the Docker containers with no caching:
`docker-compose -f .devcontainer/docker-compose.yml build --no-cache`

Start the Docker containers:
`docker-compose -f .devcontainer/docker-compose.yml up`

## More related documentations
and interesting technologies to master to enhance your ability to contribute:

- https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html
- https://www.typescriptlang.org/docs/handbook/intro.html
- https://angular.io/guide/developer-guide-overview
- https://rxjs.dev/guide/observable
- https://sass-lang.com/guide/
- https://docs.docker.com/get-started/
- https://code.visualstudio.com/docs/remote/devcontainer-cli
- https://github.com/nostr-protocol/nips
- https://github.com/nbd-wtf/nostr-tools
- https://nostrtool.com/
- https://nostr.how/en/the-protocol
- https://nostrdebug.com/
- https://nostrify.dev/
