import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as servicecatalog from 'aws-cdk-lib/aws-servicecatalog';
import { VPCProduct } from './lib/vpc-product';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // define resources here...
    
    new cdk.CfnParameter(this, "VpcCidrBlock", {
      type: "String",
      default: "10.0.0.0/18",
      description: "CIDR Block for VPC. Must be /26 or larger CIDR block.",
      allowedPattern: "^(?:[0-9]{1,3}.){3}[0-9]{1,3}[/]([0-9]?[0-6]?|[1][7-9])$",
    });


    // Create a product from a stack
    new servicecatalog.CloudFormationProduct(this, "VpcProduct", {
      productName: "vpc product",
      owner: "Product Owner",
      productVersions: [
        {
          productVersionName: "v1",
          cloudFormationTemplate: servicecatalog.CloudFormationTemplate.fromProductStack(new VPCProduct(this, "VpcProduct", { vpcCidr: "10.0.0.0/18" })),
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

new MyStack(app, 'vpc-dev', { env: devEnv });
// new MyStack(app, 'vpc-prod', { env: prodEnv });

app.synth();