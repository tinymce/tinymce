#!groovy
@Library('waluigi@release/7') _

def withLtCreds(Closure body) {
  withCredentials([usernamePassword(credentialsId: 'lambda-engci', usernameVariable: 'LT_USERNAME', passwordVariable: 'LT_ACCESS_KEY')]) {
    body()
  }
}

def inPod(name, browser, provider, bucket, buckets) {
  return { stage(name) {
    tinyPods.node([resourceRequestCpu: '6', resourceRequestMemory: '4Gi', resourceLimitCpu: '7.5', resourceLimitMemory: '4Gi']) {
      stage('test - ' + name) {
        sh 'yarn && yarn dev'
        withLtCreds {
          def bedrockCommand =
          "yarn browser-test" +
            " --chunk=50" +
            " --bedrock-browser=" + browser +
            " --remote=" + provider +
            " --bucket=" + bucket +
            " --buckets=" + buckets +
            " --name=" + name
            echo "Running: ${bedrockCommand}"
            def testStatus = sh(script: bedrockCommand, returnStatus: true)
            echo "Writing JUnit results for ${name}"
            // junit allowEmptyResults: true, testResults: 'scratch/'
            if (testStatus == 4) {
              unstable("Test failed for ${name}")
            } else if (testStatus != 0) {
              error("Error running tests for ${name}")
            }
        }

      }
    }
  }}
}

def platforms = [
  [ browser: 'chrome', provider: 'lambdatest'],
  [ browser: 'safari', provider: 'lambdatest']
];

def processes = [:]

for (int i = 0; i < platforms.size(); i++) {
  def platform = platforms.get(i)
  def buckets = platform.buckets ?: 1
  for (int bucket = 1; buckets <= buckets; bucket++) {
    def suffix = buckets == 1 ? "" : "-" + bucket
    def c_bucket = bucket
    def name = "${platform.browser}-${platform.provider}${suffix}"
    processes[name] = {
      inPod(name, platform.browser, platform.provider, c_bucket, buckets)
    }
  }
}

timestamps {
  tinyPods.node([
    resourceRequestCpu: '6',
    resourceRequestMemory: '4Gi',
    resourceLimitCpu: '7.5',
    resourceLimitMemory: '4Gi'
  ]) {
    stage('Install') {
      //clean and install? Running in pods we can just install
      yarnInstall()
    }

    stage('Type check') {
      withEnv(["NODE_OPTIONS=--max-old-space-size=1936"]) {
        exec("yarn ci-all-seq")
      }
    }

    stage('Moxiedoc check') {
      sh 'yarn tinymce-grunt shell:moxiedoc'
    }

    stage('Run tests') {
      parallel processes
    }
  }
}