import {SvnService} from '../svn-service';
import {GitAnnotationHtmlDirectorFactory} from '../git-annotation/git-annotation-html-director-factory';

export class SvnAnnotationContentGenerator {
    private readonly _svnService: SvnService;
    private readonly _gitAnnotationHtmlDirectorFactory: GitAnnotationHtmlDirectorFactory;

    constructor(params) {
        this._svnService = params.svnService;
        this._gitAnnotationHtmlDirectorFactory = params.gitAnnotationHtmlDirectorFactory;
    }

    generate(params) {
        return this._getRepositoryRoot(params).then(repositoryRoot => {
            return this._svnService.getBlame(params.path, params.commitHash, repositoryRoot)
                .then(blameLines => {
                    const gitAnnotationHtmlDirector = this._gitAnnotationHtmlDirectorFactory.create();
                    return gitAnnotationHtmlDirector.construct(blameLines, repositoryRoot);
                });
        });
    }

    _getRepositoryRoot(params) {
        return Promise.resolve(
            params.repositoryRoot || this._svnService.getRepositoryRoot(params.path)
        );
    }

}
