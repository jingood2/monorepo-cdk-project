import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as servicecatalog from 'aws-cdk-lib/aws-servicecatalog';
import { Construct } from 'constructs';
import { EksClusterProduct } from './lib/eks-cluster-product';

export class MyStack extends Stack {
  //readonly portfolio: servicecatalog.IPortfolio;
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // Create a product from a stack
    /* new servicecatalog.CloudFormationProduct(this, 'Product', {
        productName: "eks product",
        owner: "Product Owner",
        productVersions: [
          {
            productVersionName: "v1",
            cloudFormationTemplate: servicecatalog.CloudFormationTemplate.fromProductStack(new EksClusterProduct(this, 'EksClusterProduct')),
          },
        ],
    }); */

    // Create a product from a stack
    new servicecatalog.CloudFormationProduct(this, 'EKSProduct', {
      productName: 'EKS Product',
      owner: 'SK Cloud Transformation Group',
      replaceProductVersionIds: true,
      productVersions: [
        {
          productVersionName: 'v1',
          cloudFormationTemplate: servicecatalog.CloudFormationTemplate.fromProductStack(
            new EksClusterProduct(this, 'EKS', {
              templatename: 'eks-dev.template.yml',
            }),
          ),
        },
        {
          productVersionName: 'v2',
          cloudFormationTemplate: servicecatalog.CloudFormationTemplate.fromProductStack(
            new EksClusterProduct(this, 'EKSExistingVPC', {
              templatename: 'eks-cluster-existing-vpc.yml',
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

new MyStack(app, 'eks-dev', { env: devEnv });
// new MyStack(app, 'eks-prod', { env: prodEnv });

app.synth();
