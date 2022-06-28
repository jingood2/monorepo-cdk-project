
import { App, CfnParameter, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as servicecatalog from 'aws-cdk-lib/aws-servicecatalog';
import { Construct } from 'constructs';
import { GithubOidcProviderConstruct } from './github-oidc-provider-construct';

export class SimpleStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new Bucket(this, "my-simple-bucket", {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

     const owner = new CfnParameter(this, "GithubOwner", {
       type: "String",
       description: "GitHub Owner",
       default: "jingood2",
     });

     const repo = new CfnParameter(this, "GithubRepo", {
       type: "String",
       description: "GitHub Repository",
       default: "monorepo-cdk-project",
     });
   
     const role = new CfnParameter(this, "GithubRole", {
       type: "String",
       description: "GitHub Role",
       default: "jingood2",
     });

    new servicecatalog.CloudFormationProduct(this, "GithubOIDCProduct", {
      productName: "Github OIDC Provider Product2",
      owner: "SK Cloud Transformation Group",
      productVersions: [
        {
          productVersionName: "v1.0",
          cloudFormationTemplate: servicecatalog.CloudFormationTemplate.fromProductStack(
            new GithubOidcProviderConstruct(new SimpleStack(this,'s3', {}), "GithubOIDCProvider", {
              owner: owner.valueAsString,
              repo: repo.valueAsString,
              role: role.valueAsString,
            }),
          ),
        },
      ],
    });
 
  }
}



// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'github-oidc-provider', { env: devEnv });

app.synth();
