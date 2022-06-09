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

    const ENV = new cdk.CfnParameter(this, "Environment", {
      description: "Environment",
      type: "String",
      default: "dev",
      allowedValues: ["appliance", "dev", "shared", "prod"],
    });

    const PUB_CIDR_MASK = new cdk.CfnParameter(this, "PubCidrMask", {
      type: "Number",
      default: 28,
      description: "Public Subnet CIDR Block Mask for VPC. Must be /26 or larger CIDR block.",
      //allowedPattern: "^(?:[0-9]{1,3}.){3}[0-9]{1,3}[/]([0-9]?[0-6]?|[1][7-9])$",
    });

    const PRI_CIDR_MASK = new cdk.CfnParameter(this, "PriCidrMask", {
      type: "Number",
      default: 24,
      description: "Private Subnet CIDR Block Mask for VPC. Must be /21 or larger CIDR block.",
      //allowedPattern: "^(?:[0-9]{1,3}.){3}[0-9]{1,3}[/]([0-9]?[0-6]?|[1][7-9])$",
    });

    const DB_CIDR_MASK = new cdk.CfnParameter(this, "DBCidrMask", {
      type: "Number",
      default: 28,
      description: "DB Subnet CIDR Block Mask for VPC. Must be /28 or larger CIDR block.",
      //allowedPattern: "^(?:[0-9]{1,3}.){3}[0-9]{1,3}[/]([0-9]?[0-6]?|[1][7-9])$",
    });

    // Create a product from a stack
    new servicecatalog.CloudFormationProduct(this, "VpcProduct", {
      productName: "vpc product",
      owner: "Product Owner",
      productVersions: [
        {
          productVersionName: "v1",
          cloudFormationTemplate: servicecatalog.CloudFormationTemplate.fromProductStack(new VPCProduct(this, "VpcProduct", {
            vpcCidr: "10.1.0.0/18",
            envStr: cdk.Lazy.string({ produce: () => ENV.valueAsString }),
            pub_mask: cdk.Lazy.number({ produce: () => PUB_CIDR_MASK.valueAsNumber }),
            pri_mask: cdk.Lazy.number({ produce: () => PRI_CIDR_MASK.valueAsNumber }),
            db_mask: cdk.Lazy.number({ produce:() => DB_CIDR_MASK.valueAsNumber  }),
          })),
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