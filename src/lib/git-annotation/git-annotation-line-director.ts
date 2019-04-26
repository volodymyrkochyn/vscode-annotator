
import {GitAnnotationLineValues} from './git-annotation-line-values';

export class GitAnnotationLineDirector {
    private readonly _builder: any;
    private readonly _formatDateTime: any;

    constructor({builder, formatDateTime}) {
        this._builder = builder;
        this._formatDateTime = formatDateTime;
    }

    construct(params) {
        const line = new GitAnnotationLineValues({
            lineBlame: params.lineBlame,
            lineNumber: params.lineNumber,
            lineNumberWidth: params.lineNumberWidth,
            repositoryRoot: params.repositoryRoot,
            formatDateTime: this._formatDateTime
        });
        this._builder.addDetails(line.details);
        this._builder.addCommand(line.command);
        this._builder.addCaption(line.caption);
        this._builder.addCommitHash(line.commitHash);
        this._builder.addLineContents(line.lineContents);
        return this._builder.getHtml();
    }

}
