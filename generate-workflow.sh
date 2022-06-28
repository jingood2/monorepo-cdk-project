# read the workflow template
MAIN_WORKFLOW_TEMPLATE=$(cat .github/main-template.yaml)
JOB_WORKFLOW_TEMPLATE=$(cat .github/job-template.yaml)

BUILD_ACCOUNT='037729278610'
TARGET_DEPLOY_ACCOUNTS=('037729278610')

# ACCOUNT 수만큼 reusable template에 deploy-prod 추가
for PROJECT in $(ls projects); do
    echo "generating workflow for projects/${PROJECT}"

    MAIN_WORKFLOW=$(echo "${MAIN_WORKFLOW_TEMPLATE}" | sed "s/{{PROJECT}}/${PROJECT}/g")
    echo "${MAIN_WORKFLOW}" > .github/workflows/${PROJECT}.yaml

    for ACCOUNT in ${TARGET_DEPLOY_ACCOUNTS[@]}; do
        JOB_WORKFLOW=$(echo "${JOB_WORKFLOW_TEMPLATE}" | sed "s/{{TARGET_ACCOUNT}}/${ACCOUNT}/g" | sed "s/{{PROJECT}}/${PROJECT}/g")
        echo "${JOB_WORKFLOW}" >> .github/workflows/${PROJECT}.yaml
    done
done