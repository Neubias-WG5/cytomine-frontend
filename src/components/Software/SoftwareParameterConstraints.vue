<template>
    <div v-if="parameterConstraints && parameterConstraints.length > 0">
        <ul class="list-unstyled">
            <li v-for="pc in parameterConstraints" :key="pc.id">
                <template v-if="constraintById(pc.parameterConstraint).name == 'minimum'">
                    Must be > {{pc.value}}
                </template>
                <template v-else-if="constraintById(pc.parameterConstraint).name == 'maximum'">
                    Must be < {{pc.value}}
                </template>
                <template v-else-if="constraintById(pc.parameterConstraint).name == 'integer'">
                    Must be an integer
                </template>
                <template v-else-if="constraintById(pc.parameterConstraint).name == 'in'">
                    Must be a value among {{pc.value}}
                </template>
            </li>
        </ul>
    </div>
    <span v-else>/</span>
</template>

<script>
    export default {
        name: "SoftwareParameterConstraints",
        props: [
            'parameterConstraints',
            'constraints'
        ],
        methods: {
            constraintById(id) {
                return this.constraints.find(s => {
                    return s.id === id;
                });
            }
        }
    }
</script>

<style scoped>

</style>
