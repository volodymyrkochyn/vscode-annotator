import {ChangedFileLabelMaker} from './changed-file-label-maker';
import {AnnotateCommand} from './command/annotate';
import {AnnotateSvnCommand} from './command/svnannotate';
import {SwitchDiffCommand} from './command/switch-diff';
import {AppIntegrator} from './app-integrator';
import {ChangedFileListParser} from './changed-file-list-parser';
import {ChangedFilePicker} from './changed-file-picker';
import {ConfigStore} from './config-store';
import {EditorTitleResolver} from './editor-title-resolver';
import {GitAnnotationContentGenerator} from './git-annotation/git-annotation-content-generator';
import {SvnAnnotationContentGenerator} from './svn-annotator/svn-annotation-content-generator';
import {GitAnnotationHtmlDirectorFactory} from './git-annotation/git-annotation-html-director-factory';
import {GitBlameOutputParser} from './git-blame-output-parser';
import {SvnBlameOutputParser} from './svn-blame-output-parser';
import {GitContentProvider} from './git-content-provider';
import {SvnContentProvider} from './svn-content-provider';
import {GitService} from './git-service';
import {SvnService} from './svn-service';
import {ShellCommandRunner} from './shell-command-runner';
import {TakeDiffCommand} from './command/take-diff';
import {UriService} from './uri-service';
import {SvnLogService} from './svn-annotator/svn-log-service';

const childProcess = require('child_process');
const vscode = require('vscode');

export class AppIntegratorFactory {
    private readonly _extensionContext: any;
    private _annotateCommand: AnnotateCommand;
    private _annotateSvnCommand: AnnotateSvnCommand;
    private _changedFilePicker: ChangedFilePicker;
    private _configStore: ConfigStore;
    private _editTitleResolver: EditorTitleResolver;
    private _gitAnnotationContentGenerator: GitAnnotationContentGenerator;
    private _svnAnnotationContentGenerator: SvnAnnotationContentGenerator;
    private _gitAnnotationHtmlDirectorFactory: GitAnnotationHtmlDirectorFactory;
    private _gitContentProvider: GitContentProvider;
    private _svnContentProvider: SvnContentProvider;
    private _gitService: GitService;
    private _svnService: SvnService;
    private _switchDiffCommand: SwitchDiffCommand;
    private _takeDiffCommand: TakeDiffCommand;
    private _uriService: UriService;
    private _svnLogService: SvnLogService;

    constructor(extensionContext) {
        this._extensionContext = extensionContext;
    }

    create() {
        return new AppIntegrator({
            vscode,
            gitContentProvider: this._getGitContentProvider(),
            annotateCommand: this._getAnnotateCommand(),
            annotateSvnCommand: this._getAnnotateSvnCommand(),
            switchDiffCommand: this._getSwitchDiffCommand(),
            takeDiffCommand: this._getTakeDiffCommand()
        });
    }

    _getAnnotateCommand() {
        this._annotateCommand = this._annotateCommand || this._createAnnotateCommand();
        return this._annotateCommand;
    }

    _getAnnotateSvnCommand() {
        this._annotateSvnCommand = this._annotateSvnCommand || this._createAnnotateSvnCommand();
        return this._annotateSvnCommand;
    }

    _createAnnotateCommand() {
        return new AnnotateCommand({
            vscode,
            extensionContext: this._extensionContext,
            contentProvider: this._getGitContentProvider(),
            editorTitleResolver: this._getEditTitleResolver(),
            logger: this._getLogger(),
            uriService: this._getUriService()
        });
    }

    _createAnnotateSvnCommand() {
        return new AnnotateSvnCommand({
            vscode,
            extensionContext: this._extensionContext,
            contentProvider: this._getSvnContentProvider(),
            editorTitleResolver: this._getEditTitleResolver(),
            logger: this._getLogger(),
            uriService: this._getUriService()
        });
    }

    _getChangedFilePicker() {
        this._changedFilePicker = this._changedFilePicker || this._createChangedFilePicker();
        return this._changedFilePicker;
    }

    _createChangedFilePicker() {
        return new ChangedFilePicker({
            changedFileLabelMaker: new ChangedFileLabelMaker(),
            window: vscode.window
        });
    }

    _getConfigStore() {
        this._configStore = this._configStore || this._createConfigStore();
        return this._configStore;
    }

    _createConfigStore() {
        return new ConfigStore({workspace: vscode.workspace});
    }

    _getEditTitleResolver() {
        this._editTitleResolver = this._editTitleResolver || this._createEditTitleResolver();
        return this._editTitleResolver;
    }

    _createEditTitleResolver() {
        return new EditorTitleResolver({workspaceRoot: vscode.workspace.rootPath});
    }

    _getGitAnnotationContentGenerator() {
        this._gitAnnotationContentGenerator = this._gitAnnotationContentGenerator ||
                this._createGitAnnotationContentGenerator();
        return this._gitAnnotationContentGenerator;
    }

    _getSvnAnnotationContentGenerator() {
        this._svnAnnotationContentGenerator = this._svnAnnotationContentGenerator ||
                this._createSvnAnnotationContentGenerator();
        return this._svnAnnotationContentGenerator;
    }

    _createGitAnnotationContentGenerator() {
        return new GitAnnotationContentGenerator({
            gitAnnotationHtmlDirectorFactory: this._getGitAnnotationHtmlDirectorFactory(),
            gitService: this._getGitService()
        });
    }

    _createSvnAnnotationContentGenerator() {
        return new SvnAnnotationContentGenerator({
            gitAnnotationHtmlDirectorFactory: this._getGitAnnotationHtmlDirectorFactory(),
            svnService: this._getSvnService()
        });
    }

    _getGitAnnotationHtmlDirectorFactory() {
        this._gitAnnotationHtmlDirectorFactory = this._gitAnnotationHtmlDirectorFactory ||
                this._createGitAnnotationHtmlDirectorFactory();
        return this._gitAnnotationHtmlDirectorFactory;
    }

    _createGitAnnotationHtmlDirectorFactory() {
        return new GitAnnotationHtmlDirectorFactory({
            configStore: this._getConfigStore()
        });
    }

    _getGitContentProvider() {
        this._gitContentProvider = this._gitContentProvider || this._createGitContentProvider();
        return this._gitContentProvider;
    }

    _getSvnContentProvider() {
        this._svnContentProvider = this._svnContentProvider || this._createSvnContentProvider();
        return this._svnContentProvider;
    }

    _createGitContentProvider() {
        return new GitContentProvider({
            gitAnnotationContentGenerator: this._getGitAnnotationContentGenerator(),
            gitService: this._getGitService(),
            uriService: this._getUriService()
        });
    }

    _createSvnContentProvider() {
        return new SvnContentProvider({
            svnAnnotationContentGenerator: this._getSvnAnnotationContentGenerator(),
            svnService: this._getSvnService(),
            uriService: this._getUriService()
        });
    }

    _getGitService() {
        this._gitService = this._gitService || this._createGitService();
        return this._gitService;
    }

    _getSvnService() {
        this._svnService = this._svnService || this._createSvnService();
        return this._svnService;
    }

    _createGitService() {
        return new GitService({
            configStore: this._getConfigStore(),
            changedFileListParser: new ChangedFileListParser(),
            gitBlameOutputParser: new GitBlameOutputParser(),
            shellCommandRunner: new ShellCommandRunner({childProcess})
        });
    }

    _createSvnService() {
        return new SvnService({
            configStore: this._getConfigStore(),
            changedFileListParser: new ChangedFileListParser(),
            svnBlameOutputParser: new SvnBlameOutputParser(),
            shellCommandRunner: new ShellCommandRunner({childProcess}),
            svnLogService: this._getSvnLogService()
        });
    }

    _getLogger() {
        return console;
    }

    _getSwitchDiffCommand() {
        this._switchDiffCommand = this._switchDiffCommand || this._createSwitchDiffCommand();
        return this._switchDiffCommand;
    }

    _createSwitchDiffCommand() {
        return new SwitchDiffCommand({
            logger: this._getLogger(),
            uriService: this._getUriService(),
            gitService: this._getGitService(),
            changedFilePicker: this._getChangedFilePicker(),
            commands: vscode.commands
        });
    }

    _getTakeDiffCommand() {
        this._takeDiffCommand = this._takeDiffCommand || this._createTakeDiffCommand();
        return this._takeDiffCommand;
    }

    _createTakeDiffCommand() {
        return new TakeDiffCommand({
            commands: vscode.commands,
            editorTitleResolver: this._getEditTitleResolver(),
            logger: this._getLogger(),
            uriService: this._getUriService()
        });
    }

    _getUriService() {
        this._uriService = this._uriService || this._createUriService();
        return this._uriService;
    }

    _createUriService() {
        return new UriService({
            Uri: vscode.Uri,
            getCurrentDateFn: () => Date.now()
        });
    }

    _getSvnLogService() {
        this._svnLogService = this._svnLogService || this._createSvnLogService();
        return this._svnLogService;
    }

    _createSvnLogService() {
        return new SvnLogService({
            configStore: this._getConfigStore(),
            shellCommandRunner: new ShellCommandRunner({childProcess})
        });
    }

}
