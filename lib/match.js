class Match {
    constructor({ text = '', start = {}, end = {} } = {}) {
        this.text = text;
        this.start = start;
        this.end = end;
    }
    
    get indexes() {
        return [this.start.index, this.end.index];
    }

    get nodes() {
        return [this.start.node, this.end.node];
    }

    get keys() {
        return ['start', 'end']
    }

    get prev() {
        return {
            data: this.start.data.prev,
            type: 'text',
            next: null,
            prev: null,
            parent: this.start.node.parent
        }
    }

    get next() {
        return {
            data: this.end.data.next,
            type: 'text',
            next: null,
            prev: null,
            parent: this.end.node.parent
        }
    }

    get mark() {
        const mark = this.createMark();
        mark.children.push({
            data: this.text,
            type: 'text',
            next: null,
            prev: null,
            parent: null
        });
        return mark;
    }

    get markStart() {
        const mark = this.createMark();
        mark.children.push({
            data: this.start.data.next,
            type: 'text',
            next: null,
            prev: null,
            parent: null
        });
        return mark;
    }

    get markEnd() {
        const mark = this.createMark();
        mark.children.push({
            data: this.end.data.prev,
            type: 'text',
            next: null,
            prev: null,
            parent: null
        });
        return mark;
    }

    createMark() {
        return {
            type: 'tag',
            name: 'mark',
            attribs: {},
            children: [],
            next: null,
            prev: null,
            parent: null
        };
    }
}

module.exports = Match;