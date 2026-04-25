node {

    def buildStatus = 'SUCCESS'
    def slackNotify

    try {
        stage('Checkout') {
            checkout scm
        }

        // Configs
        def config = [
            appName: 'mooninary-bake-fe',
            dockerUser: 'fleeforezz',

            release: '1.0.0',
            dev: '1.0.0',
            
            containerPort: '8080',
            testPort: '8081',
            devPort: '8082',
            prodPort: '8083',
            
            devServer: 'jso@dev.local',

            manifestRepo: 'https://github.com/G4-Data-Labeling-Support-System/Infrastructure.git',
            // env: '${env.BRANCH_NAME == 'main' ? 'production' : 'development'}',
            // k8sNamespace: '${env.BRANCH_NAME == 'main' ? 'prod' : 'dev'}'
        ]

        // Env variables
        slackNotify = load "ci/slack.groovy"
        def sonarqubePipeline = load "ci/sonarqube.groovy"
        def trivyFilesystemScan = load "ci/trivy-filesystem-scan.groovy"
        def dockerPipeline = load "ci/docker.groovy"

        def deployProd = load "ci/deploy-prod.groovy"
        def deployDev = load "ci/deploy-dev.groovy"

        def updateManifest = load "ci/update-manifest.groovy"

        // Call functions base on branch
        if (env.BRANCH_NAME == "main") {
            // sonarqubePipeline.call(config)
            // trivyFilesystemScan.call()
            dockerPipeline.call(config)
            deployProd.call(config)
            // updateManifest.call(config)
        } else if (env.BRANCH_NAME == "develop") {
            // sonarqubePipeline.call(config)
            // trivyFilesystemScan.call()
            dockerPipeline.call(config)
            deployDev.call(config)
            // updateManifest.call(config)
        }
    }
    catch (err) {
        buildStatus = 'FAILURE'
        currentBuild.result = 'FAILURE'
        throw err // keep pipeline failed
    } finally {
        if (slackNotify != null) {
            slackNotify.call(buildStatus)
        } else {
            echo "Slack notify not loaded"
        }

        sh"""
            docker image prune -f
            docker rmi \$(docker images -q 'fleeforezz/data-labeling-fe') --force || true
        """

        // Clean up workspace after run the pipeline
        stage('Cleanup') {
            cleanWs()
        }
    }

}