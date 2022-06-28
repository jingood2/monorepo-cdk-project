# read the workflow template
MULTI_ACCOUNT_WORKFLOW_TEMPLATE=$(cat .github/cross-account-deploy-template.yml)
MAIN_WORKFLOW_TEMPLATE=$(cat .github/main-template.yaml)
CD_WORKFLOW_TEMPLATE=$(cat .github/lambda-cd-template.yml)

BUILD_ACCOUNT='037729278610'
TARGET_DEPLOY_ACCOUNTS=('037729278610')


MAIN_WORKFLOW=$(echo "${MAIN_WORKFLOW_TEMPLATE}" | sed "s/{{ACCOUNT}}/${ACCOUNT}/g")


# ACCOUNT 수만큼 reusable template에 deploy-prod 추가
for ACCOUNT in ${TARGET_DEPLOY_ACCOUNTS[@]}; do
    CD_WORKFLOW=$(echo "${CD_WORKFLOW_TEMPLATE}" | sed "s/{{ACCOUNT}}/${ACCOUNT}/g")
    echo "${CD_WORKFLOW}" >> .github/workflows/reusable-lambda-ci.yml
done

for PROJECT in $(ls projects); do
    echo "generating workflow for projects/${PROJECT}"

    # replace template route placeholder with route name
    WORKFLOW=$(echo "${MULTI_ACCOUNT_WORKFLOW_TEMPLATE}" | sed "s/{{PROJECT}}/${ROUTE}/g")
    WORKFLOW=$(echo "${WORKFLOW}" | sed "s/{{ACCOUNT}}/${BUILD_ACCOUNT}/g")

    # save workflow to .github/workflows/{PROJECT}
    echo "${WORKFLOW}" > .github/workflows/${PROJECT}.yaml
done