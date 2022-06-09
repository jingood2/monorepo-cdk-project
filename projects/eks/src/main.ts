import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as servicecatalog from 'aws-cdk-lib/aws-servicecatalog';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { envVars } from './config';

export class MyStack extends Stack {
  readonly portfolio: servicecatalog.IPortfolio;
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    if (envVars.SC_PORTFOLIO_ARN != '') {
      this.portfolio = servicecatalog.Portfolio.fromPortfolioArn(this, 'ImportedNetworkPortfolio', envVars.SC_PORTFOLIO_ARN);
    } else {
      this.portfolio = new servicecatalog.Portfolio(this, envVars.SC_PORTFOLIO_NAME, {
        displayName: envVars.SC_PORTFOLIO_NAME ?? 'DemoPortfolio',
        providerName: 'SK Cloud Transformation Group',
        description: 'AWS Service Catalog EKS Product ',
        messageLanguage: servicecatalog.MessageLanguage.EN,
      });

      if (envVars.SC_ACCESS_GROUP_NAME != '') {
        const group = iam.Group.fromGroupName(this, 'SCGroup', envVars.SC_ACCESS_GROUP_NAME);
        this.portfolio.giveAccessToGroup(group);
      }

      if (envVars.SC_ACCESS_ROLE_ARN != '') {
        this.portfolio.giveAccessToRole(iam.Role.fromRoleArn(this, `${envVars.SC_PORTFOLIO_NAME}-Role`, envVars.SC_ACCESS_ROLE_ARN));
      } else {
        this.portfolio.giveAccessToRole(iam.Role.fromRoleArn(this, `${envVars.SC_PORTFOLIO_NAME}AdminRole`, `arn:aws:iam::${process.env.CDK_DEFAULT_ACCOUNT}:role/AssumableAdminRole`));
      }

      // Create a product from a stack
      class S3BucketProduct extends servicecatalog.ProductStack {
        constructor(scope: Construct, id: string) {
          super(scope, id);

          new s3.Bucket(this, 'BucketProduct');
        }
      }

      new servicecatalog.CloudFormationProduct(this, 'Product', {
        productName: "eks product",
        owner: "Product Owner",
        productVersions: [
          {
            productVersionName: "v1",
            cloudFormationTemplate: servicecatalog.CloudFormationTemplate.fromProductStack(new S3BucketProduct(this, 'S3BucketProduct')),
          },
        ],
      });
    }
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'eks-dev', { env: devEnv });
// new MyStack(app, 'eks-prod', { env: prodEnv });

app.synth();