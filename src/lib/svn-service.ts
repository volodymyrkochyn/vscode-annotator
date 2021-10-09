import {ChangedFileListParser} from './changed-file-list-parser';
import {ConfigStore} from './config-store';
import {ShellCommandRunner} from './shell-command-runner';
import {SvnBlameOutputParser} from './svn-blame-output-parser';
import { SvnLogService} from './svn-annotator/svn-log-service';

const path = require('path');

export class SvnService {
    private readonly _changedFileListParser: ChangedFileListParser;
    private readonly _configStore: ConfigStore;
    private readonly _shellCommandRunner: ShellCommandRunner;
    private readonly _svnBlameOutputParser: SvnBlameOutputParser;
    private readonly _svnLogService: SvnLogService;

    constructor(params) {
        this._changedFileListParser = params.changedFileListParser;
        this._configStore = params.configStore;
        this._shellCommandRunner = params.shellCommandRunner;
        this._svnBlameOutputParser = params.svnBlameOutputParser;
        this._svnLogService = params.svnLogService;
    }

    getBlame(filePath, commitHash, repositoryRoot) {
        console.log(filePath);
        this._svnLogService.setRepositoryRoot("/home/volodymyrk/svnfolder/test2/");
        const options = {cwd: repositoryRoot};
        console.log(options);
        //const extraBlameOptions = this._ignoreWhitespaceOnBlame ? ['-w'] : [];
        const commitHashArg = commitHash ? [commitHash] : [];
        const args = ['blame', '-v', '--', ...commitHashArg, filePath];
        return this._shellCommandRunner.run(this._svnPath, args, options)
            .then(output => this._svnBlameOutputParser.parse(output, this._svnLogService));
    }

    getChangedFilesInCommit(commitHash, repositoryRoot) {
        const options = {cwd: repositoryRoot};
        const args = ['diff-tree', commitHash, '--name-status', '--parents', '--root', '-M', '-r'];
        return this._shellCommandRunner.run(this._svnPath, args, options)
            .then(output => this._changedFileListParser.parse(output));
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
