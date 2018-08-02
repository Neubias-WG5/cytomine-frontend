<template>
    <span>
        <template v-if="sourceCodeProvider == 'github'">
            <i class="fa fa-github fa-fw" aria-hidden="true"></i> GitHub
        </template>
        <template v-else-if="sourceCodeProvider == 'gitlab'">
            <i class="fa fa-gitlab fa-fw" aria-hidden="true"></i> GitLab
        </template>
        <template v-else>
            <i class="fa fa-bitbucket fa-fw" aria-hidden="true"></i> Bitbucket
        </template>
         [{{softwareRepository.username}}]
        <template v-if="softwareRepository.prefix">(with prefix "{{softwareRepository.prefix}}") </template>
        <br><i class="fa fa-ship fa-fw" aria-hidden="true"></i> DockerHub [{{softwareRepository.dockerUsername}}]
    </span>
</template>

<script>
    export default {
        name: "SoftwareRepositoryName",
        props: ['softwareRepository'],
        computed: {
            sourceCodeProvider() {
                console.log(this.softwareRepository);
                let provider = this.softwareRepository.provider.toLowerCase();
                if (provider.includes("github"))
                    return "github";
                else if (provider.includes("gitlab"))
                    return "gitlab";
                else
                    return "bitbucket";
            },
            environmentProvider() {
                return "docker";
            }
        }
    }
</script>

<style scoped>

</style>
