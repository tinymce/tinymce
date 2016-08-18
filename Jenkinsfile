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

    def permutations = [:]


    permutations = [
      [ name: "win10Chrome", os: "windows-10", browser: "chrome", sh: false ],
      [ name: "win10FF", os: "windows-10", browser: "firefox", sh: false ],
      [ name: "win10Edge", os: "windows-10", browser: "MicrosoftEdge", sh: false ],
      [ name: "win10IE", os: "windows-10", browser: "ie", sh: false ]
    ]

    def processes = [:]

    for (int i = 0; i < permutations.size(); i++) {
        def permutation = permutations.get(i);
        def name = permutation.name;
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
                } else {
                  bat bedrockCmd
                }
                
                echo "Writing results"
                step([$class: 'JUnitResultArchiver', testResults: 'scratch/TEST-*.xml'])
            }
        }
    }

    //stage "Browser Tests"
    //parallel processes

    stage "Building"
    dir("alloy") {
      sh "ent"
    }

    stage "Archiving Artifacts"
    step([$class: 'ArtifactArchiver', artifacts: 'alloy/scratch'])
}


