import {SvnService} from './svn-service';
import {SvnAnnotationContentGenerator} from './svn-annotator/svn-annotation-content-generator';
import {UriService} from './uri-service';

const querystring = require('querystring');

export class SvnContentProvider {
    private readonly _svnService: SvnService;
    private readonly _svnAnnotationContentGenerator: SvnAnnotationContentGenerator;
    private readonly _uriService: UriService;

    constructor(params) {
        this._svnService = params.svnService;
        this._svnAnnotationContentGenerator = params.svnAnnotationContentGenerator;
        this._uriService = params.uriService;
    }

    provideTextDocumentContent(uri) {
        const action = this._uriService.getAction(uri);
        switch (action) {
        case 'annotate-file':
            return this._getAnnotationContents(uri);
        case 'show-file':
            return this._getFileContents(uri);
        default:
            return Promise.reject(new Error('Unknown action'));
        }
    }

    _getAnnotationContents(uri) {
        const params = querystring.parse(uri.query);
        return this._svnAnnotationContentGenerator.generate(params);
    }

    _getFileContents(uri) {
        const params = querystring.parse(uri.query);
        if (!params.path) return Promise.resolve('');
        return this._svnService.getFileContents(params.commitHash, params.path, params.repositoryRoot);
    }

}
