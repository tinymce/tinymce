node("vanguard") {
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

def processes = [:]
def browsers = ["chrome","firefox","MicrosoftEdge"]

for (int i = 0; i < browsers.size(); i++) {
    def browser = browsers.get(i);
    processes[browser] = {
        node("bedrock") {
            echo "Slave checkout"
            git([branch: "VAN-1", url:'ssh://git@stash:7999/van/alloy.git', credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])
            
            
            echo "Dent"
            bat "dent"
            
            echo "Browser tests"
            bat "bedrock-auto -b " + browser + " --testdir src/test/js/browser --name " + browser
            
            echo "Writing results"
            step([$class: 'JUnitResultArchiver', testResults: 'scratch/TEST-*.xml'])
        }
    }
}

parallel processes