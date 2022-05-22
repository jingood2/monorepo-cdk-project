import { GithubActionsIdentityProvider, GithubActionsRole } from "aws-cdk-github-oidc";
import { App, Duration, Stack, StackProps } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    /**
     * Create an Identity provider for GitHub inside your AWS Account. This
     * allows GitHub to present itself to AWS IAM and assume a role.
     */
    const provider = new GithubActionsIdentityProvider(this, "GithubProvider");

    const deployRole = new GithubActionsRole(this, "GithubDeployRole", {
      provider: provider, // reference into the OIDC provider
      owner: "jingood2", // your repository owner (organization or user) name
      repo: "github-monorepo-ci", // your repository name (without the owner name)
      roleName: "github-deploy-v2-role",
      description: "This role deploys stuff to AWS v2",
      maxSessionDuration: Duration.hours(2),
    });

    deployRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"));
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, "bootstrap-dev", { env: devEnv });

app.synth();
