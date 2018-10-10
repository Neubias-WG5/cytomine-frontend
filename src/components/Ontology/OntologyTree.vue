<template>
    <div>
        <sl-vue-tree v-model="tree">
            <template slot="title" slot-scope="{ node }">
                <term :color="node.data.color" :is-leaf="node.isLeaf" :is-expanded="node.isExpanded"
                      :name="node.title" :size="sizeTerms[node.data.id]"></term>
            </template>

            <template slot="toggle" slot-scope="{ node }">
                <span v-if="!node.isLeaf">
                    <i v-if="node.isExpanded" class="fa fa-chevron-down"></i>
                    <i v-if="!node.isExpanded" class="fa fa-chevron-right"></i>
                </span>
            </template>

            <template slot="sidebar" slot-scope="{ node }">
                <div class="btn-group" v-if="!node.data.root">
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: isAssociable(node.data.id)}]"
                            @click="toggleAssociate(node.data.id)" title="Associate this term to new annotations"
                            v-if="node.isLeaf">
                        <i class="fas fa-thumbtack"></i>
                        Associate
                    </button>
                    <button :class="['btn', 'btn-default', 'btn-xs', {active: isVisible(node.data.id)}]"
                            @click="toggleVisibility(node.data.id)" title="See annotations with this term">
                        <i class="fas fa-eye"></i>
                        Show
                    </button>
                </div>

                <div class="btn-group" v-if="node.data.root">
                    <button class="btn btn-default btn-xs" @click="showAll(true)"><i class="fas fa-eye"></i> Show all
                    </button>
                    <button class="btn btn-default btn-xs" @click="showAll(false)"><i class="fas fa-eye-slash"></i> Hide
                        all
                    </button>
                </div>
            </template>
        </sl-vue-tree>

    </div>
</template>

<script>
    import SlVueTree from "sl-vue-tree/dist/sl-vue-tree";
    import Term from "./Term";

    export default {
        name: "OntologyTree",
        components: {Term, SlVueTree},
        props: ['ontology', 'editable', 'associatedTerms', 'visibleTerms', 'sizeTerms'],
        data() {
            return {
                tree: []
            }
        },
        computed: {
            terms() {
                if (!this.ontology)
                    return null;
                return this.getTerms(this.ontology.children)
            }
        },
        watch: {
            ontology() {
                this.makeTree();
            }
        },
        methods: {
            makeTree() {
                this.tree = [{
                    title: this.ontology.name,
                    isLeaf: false,
                    isExpanded: true,
                    isDraggable: this.editable,
                    data: {
                        id: this.ontology.id,
                        color: '#000000',
                        root: true
                    },
                    children: this.getChildren(this.ontology.children)
                }]
            },
            getChildren(children) {
                let toReturn = [];
                children.forEach(child => {
                    toReturn.push({
                        title: child.name,
                        isLeaf: !child.isFolder,
                        isExpanded: true,
                        isDraggable: this.editable,
                        data: {
                            id: child.id,
                            color: child.color,
                        },
                        children: this.getChildren(child.children)
                    })
                });
                return toReturn
            },
            getTerms(children) {
                let terms = [];
                children.forEach(child => {
                    terms.push(child.id);
                    terms.concat(this.getTerms(child.children))
                });
                return terms;
            },
            toggleAssociate(termId) {
                this.$emit('toggleAssociateTerm', termId);
            },
            toggleVisibility(termId) {
                this.$emit('toggleVisibilityTerm', termId);
            },
            isAssociable(termId) {
                return this.associatedTerms.includes(termId);
            },
            isVisible(termId) {
                return this.visibleTerms.includes(termId);
            },
            showAll(bool) {
                this.$emit('showAllTerms', bool);
            }

        },
        mounted() {
            this.makeTree();
        }
    }
</script>

<style>
    .sl-vue-tree {
        position: relative;
        cursor: default;
        user-select: none;
    }

    .sl-vue-tree-root > .sl-vue-tree-nodes-list {
        overflow: hidden;
        position: relative;
        padding-bottom: 4px;
    }

    .sl-vue-tree-node-item {
        position: relative;
        display: flex;
        flex-direction: row;
        line-height: 28px;
        border: 1px solid transparent;
    }

    .sl-vue-tree-node-item.sl-vue-tree-cursor-inside {
        border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .sl-vue-tree-gap {
        width: 25px;
        min-height: 1px;
    }

    .sl-vue-tree-toggle {
        display: inline-block;
        text-align: left;
        width: 20px;
    }

    .sl-vue-tree-sidebar {
        margin-left: auto;
        padding-left: 5px;
    }
</style>
