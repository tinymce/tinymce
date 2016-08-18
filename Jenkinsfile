node("primary") {
    stage "Make directories"
    sh "mkdir -p alloy agar boulder"
    
    stage "Master Checkout"
    dir("alloy") {
        git([branch: "VAN-1", url:'ssh://git@stash:7999/van/alloy.git', credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])
    }
    
    stage "Dependent Checkouts"
    dir("boulder") {
        git([branch: "master", url:'ssh://git@stash:7999/van/boulder.git', credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])
    }
    dir("agar") {
        git([branch: "master", url:'ssh://git@stash:7999/van/agar.git', credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])
    }
    
    stage "Atomic Tests"
    dir("alloy") {
        sh "dent && bolt test config/bolt/atomic.js \$(find src/test/js/atomic -name *.js)"
    }
}


def permutations = [:]


permutations = [
  [ os: "windows-10", browser: "chrome", sh: false ],
  [ os: "windows-10", browser: "firefox", sh: false ],
  [ os: "macos-10.11", browser: "safari", sh: true ]
]

def processes = [:]
//def browsers = ["chrome","firefox","MicrosoftEdge"]

for (int i = 0; i < permutations.size(); i++) {
    def permutation = permutations.get(i);
    def name = permutation.os + " x " + permutation.browser;
    processes[name] = {
        node("bedrock-" + permutation.os) {
            echo "Slave checkout"
            git([branch: "VAN-1", url:'ssh://git@stash:7999/van/alloy.git', credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])
            
            if (permutation.sh) {
              sh "dent"
            } else {
              bat "dent"
            }  

            def bedrockCmd = "bedrock-auto -b " + permutation.browser + " --testdir src/test/js/browser --name " + name;
            
            echo "Browser tests"
            if (permutation.sh) {
              sh bedrockCmd
            } els {
              bat bedrockCmd
            }
            
            echo "Writing results"
            step([$class: 'JUnitResultArchiver', testResults: 'scratch/TEST-*.xml'])
        }
    }
}

parallel processes