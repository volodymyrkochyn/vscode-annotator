import {ConfigStore} from '../config-store';
import {ShellCommandRunner} from '../shell-command-runner';

const path = require('path');

export class SvnLogService {
    private readonly _configStore: ConfigStore;
    private readonly _shellCommandRunner: ShellCommandRunner;
    private repositoryRoot: string;

    constructor(params) {
        this._configStore = params.configStore;
        this._shellCommandRunner = params.shellCommandRunner;
    }

    setRepositoryRoot(repo) {
        this.repositoryRoot = repo;
    }

    getLog(revision) {
        const options = {cwd: this.repositoryRoot};
        const args = ['log', '-r', revision];

        return this._shellCommandRunner.run(this._svnPath, args, options)
            .then(output => {
                console.log(output.toString().split("\n").slice(3, 1).join("\n"));
                return "test";
                //return output.split("\n").slice(3, 1).join("\n");
            });
    }

    getFileContents(commit, filePath, repositoryRoot) {
        const options = {cwd: repositoryRoot};
        return this._shellCommandRunner.run(this._svnPath, ['show', `${commit}:${filePath}`], options);
    }

    getRepositoryRoot(filePath) {
        const options = {cwd: path.dirname(filePath)};
        const args = ['info'];
        this._shellCommandRunner.run(this._svnPath, args, options).then((repositoryRoot : string) => {
            var out1 = repositoryRoot.trim().split("\n", 2);
            var out2 = out1[1].replace("Working Copy Root Path:", "");
            return out2.trim();
        });
        return '';
    }

    get _svnPath() {
        return this._configStore.getSvnConfig('path') || 'svn';
    }

    get _ignoreWhitespaceOnBlame() {
        return this._configStore.getExtensionConfig('git.ignoreWhitespaceOnBlame');
    }

}
