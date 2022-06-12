import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as servicecatalog from 'aws-cdk-lib/aws-servicecatalog';
import { VPCProduct } from './lib/vpc-product';
import { VPCV3Product } from './lib/vpc-v3-product';
//import { VpcV2Product } from './lib/vpc-v2-product';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // define resources here...


    // Create a product from a stack
    new servicecatalog.CloudFormationProduct(this, "VpcProduct", {
      productName: "vpc product",
      owner: "jingood2",
      productVersions: [
        {
          productVersionName: "v1.0",
          cloudFormationTemplate: servicecatalog.CloudFormationTemplate.fromProductStack(new VPCProduct(this, "Vpc", {})),
        },
        /*
        {
          productVersionName: "v2.0",
          cloudFormationTemplate: servicecatalog.CloudFormationTemplate.fromProductStack(new VpcV2Product(this, "VpcV2", {})),
        },
        */
        {
          productVersionName: "v3.0",
          cloudFormationTemplate: servicecatalog.CloudFormationTemplate.fromProductStack(new VPCV3Product(this, "VpcV3", {})),
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

new MyStack(app, 'vpc-test', { env: devEnv });
// new MyStack(app, 'vpc-prod', { env: prodEnv });

app.synth();