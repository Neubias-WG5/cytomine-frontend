<template>
    <span>
        <template v-if="sourceCodeProvider == 'github'">
            <a class="btn btn-primary" :href="sourceCodeUrl">
                <i class="fa fa-github fa-fw" aria-hidden="true"></i> See source code on GitHub
            </a>
        </template>
        <template v-else-if="sourceCodeProvider == 'gitlab'">
            <a class="btn btn-primary" :href="sourceCodeUrl">
                <i class="fa fa-gitlab fa-fw" aria-hidden="true"></i> See source code on GitLab
            </a>
        </template>
        <template v-else>
            <a class="btn btn-primary" :href="sourceCodeUrl">
                <i class="fa fa-bitbucket fa-fw" aria-hidden="true"></i> See source code on Bitbucket
            </a>
        </template>
        <a class="btn btn-primary" :href="environmentUrl">
            <i class="fa fa-ship fa-fw" aria-hidden="true"></i> See environment on DockerHub
        </a>
    </span>
</template>

<script>
    export default {
        name: "SoftwareSourceButtons",
        props: ['software', 'softwareRepository'],
        computed: {
            sourceCodeProvider() {
                let provider = this.softwareRepository.provider.toLowerCase();
                if (provider.includes("github"))
                    return "github";
                else if (provider.includes("gitlab"))
                    return "gitlab";
                else
                    return "bitbucket";
            },
            sourceCodeUrl() {
                let provider = this.softwareRepository.provider.toLowerCase();
                if (provider.includes("github")) {
                    let url = `https://github.com/${this.softwareRepository.username}/${this.softwareRepository.prefix}${this.software.name}`;
                    if (this.software.softwareVersion) {
                        url += `/tree/${this.software.softwareVersion}`
                    }
                    return url
                }
                else if (provider.includes("gitlab"))
                    return "#";
                else
                    return "#";
            },
            environmentUrl() {
                return `https://hub.docker.com/r/${this.softwareRepository.dockerUsername}/${this.softwareRepository.prefix.toLowerCase()}${this.software.name.toLowerCase()}`
            }
        }
    }
</script>

<style scoped>

</style>
