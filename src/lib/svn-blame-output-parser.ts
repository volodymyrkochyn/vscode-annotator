
// Porcelain format, see https://git-scm.com/docs/git-blame
import {SvnLogService} from "./svn-annotator/svn-log-service";

const ATTRIBUTE_NAME_MAP = {
    author: 'authorName',
    'author-mail': 'authorMail',
    'author-time': 'authorTime',
    'author-tz': 'authorTz',
    committer: 'committerName',
    'committer-mail': 'committerMail',
    'committer-time': 'committerTime',
    'committer-tz': 'committerTz',
    summary: 'subject',
    filename: 'filename'
};

export class SvnBlameOutputParser {

    parse(svnOutput, svnLogService: SvnLogService) {
        const lines = svnOutput.split("\n");
        let gitOutput = "";
        for (var line of lines)
        {
            const open = line.indexOf('(');
            const close = line.indexOf(')');
            const content = line.substring(close + 2);
            if ((open !== -1) && (close !== -1))
            {
                line = line.replace(line.substring(open, close + 2), '');
            }
            const l = line.split(" ");
            if (l.length < 9)
                continue;
            const rev = l[5];
            const commiter = l[6];
            const date = l[7];
            const time  = ((new Date(date + 'T' + l[8])).valueOf() / 1000).toString();
            const tz = l[9];
            let summary = "a";
            svnLogService.getLog(rev).then(out => summary = out);

            gitOutput += rev + ' 0 0 0\n';
            gitOutput += 'author ' + commiter + '\n'; 
            gitOutput += 'author-mail <skip>\n';
            gitOutput += 'author-time ' + time + '\n';
            gitOutput += 'author-tz ' + tz + '\n';
            gitOutput += 'committer ' + commiter + '\n';
            gitOutput += 'committer-mail <skip>\n';
            gitOutput += 'committer-time ' + time + '\n'
            gitOutput += 'committer-tz ' + tz + '\n';
            gitOutput += 'summary ' + summary + '\n' ;
            gitOutput += 'filename <skip>\n';
            gitOutput += '\t' + content + '\n';
        }
        return this._getLineInfoList(gitOutput).map(this._parseLineInfo.bind(this));
    }

    _getLineInfoList(gitOutput) {
        const regexForOneLineInfo = /\n\t[^\n]*\n/g;
        const lineInfoList = [];
        for (let startIndex = 0; regexForOneLineInfo.exec(gitOutput) !== null; startIndex = regexForOneLineInfo.lastIndex) {
            lineInfoList.push(gitOutput.substring(startIndex, regexForOneLineInfo.lastIndex));
        }
        return lineInfoList;
    }

    _parseLineInfo(lineInfo) {
        const lines = lineInfo.split('\n').slice(0, -1);
        const header = this._parseHeader(lines[0]);
        const attributes = lines.slice(1, -1).reduce((memo, line) => {
            return Object.assign({}, memo, this._parseAttribute(line));
        }, {});
        const lineContents = lines.slice(-1)[0].replace('\t', '');
        return Object.assign({}, header, attributes, {lineContents});
    }

    _parseHeader(commitLine) {
        const hashAndLineNumber = commitLine.split(' ');
        return {
            commitHash: hashAndLineNumber[0],
            lineNoInOriginalFile: Number(hashAndLineNumber[1]),
            lineNoInFinalFile: Number(hashAndLineNumber[2])
        };
    }

    _parseAttribute(attributeLine) {
        const delimiterIndex = attributeLine.indexOf(' ');
        return this._convertAttributeToMap(
            attributeLine.slice(0, delimiterIndex),
            attributeLine.slice(delimiterIndex + 1)
        );
    }

    _convertAttributeToMap(attributeName, attributeValue) {
        switch (attributeName) {
        case 'author-time':
        case 'committer-time':
            return {[ATTRIBUTE_NAME_MAP[attributeName]]: Number(attributeValue)};
        case 'previous': {
            const previousData = attributeValue.split(' ');
            return {
                previousCommitHash: previousData[0],
                previousFilename: previousData[1]
            };
        }
        default:
            return {[ATTRIBUTE_NAME_MAP[attributeName]]: attributeValue};
        }
    }

    // _getLineInfoList(svnOutput) {
    //     //const regexForOneLineInfo = /\n\t[^\n]*\n/g;
    //     const lineInfoList = svnOutput.split("\n");
    //     // for (let startIndex = 0; regexForOneLineInfo.exec(gitOutput) !== null; startIndex = regexForOneLineInfo.lastIndex) {
    //     //     lineInfoList.push(gitOutput.substring(startIndex, regexForOneLineInfo.lastIndex));
    //     // }
    //     return lineInfoList;
    // }

    // _parseLineInfo(lineInfo) {
    //     const lines = lineInfo.split(' ');
    //     const header = this._parseHeader(lineInfo);
    //     const attributes = lines.reduce((memo, line) => {
    //         return Object.assign({}, memo, this._parseAttribute(line));
    //     }, {});
    //     // const lineContents = lines.slice(-1)[0].replace('\t', '');
    //     const lineContents = lineInfo;
    //     return Object.assign({}, header, attributes, {lineContents});
    // }

    // _parseHeader(commitLine) {
    //     const hashAndLineNumber = commitLine.split(' ');
    //     return {
    //         commitHash: hashAndLineNumber[0],
    //         lineNoInOriginalFile: Number(0),
    //         lineNoInFinalFile: Number(0)
    //     };
    // }

    // _parseAttribute(attributeLine) {
    //     const delimiterIndex = attributeLine.indexOf(' ');
    //     return this._convertAttributeToMap(
    //         attributeLine.slice(0, delimiterIndex),
    //         attributeLine.slice(delimiterIndex + 1)
    //     );
    // }

    // _convertAttributeToMap(attributeName, attributeValue) {
    //     switch (attributeName) {
    //     case 'author-time':
    //     case 'committer-time':
    //         return {[ATTRIBUTE_NAME_MAP[attributeName]]: Number(attributeValue)};
    //     default:
    //         return {[ATTRIBUTE_NAME_MAP[attributeName]]: attributeValue};
    //     }
    // }

}
