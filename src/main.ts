import { App, Stack, StackProps, Stage } from 'aws-cdk-lib';
import { aws_s3 as s3, pipelines as cdkpipelines } from 'aws-cdk-lib'
import { Construct } from 'constructs';


const deploymentAccount = {
  account: '418648875085', // gemeentenijmegen-deployment
  region: 'eu-west-1',
};

const sandbox = {
  account: '122467643252', // Sandbox
  region: 'eu-west-1',
};





export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    new s3.Bucket(this, 'my-bucket-to-be-retained');
  }
}

export class MyStage extends Stage {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    new MyStack(this, 'my-stack', {
      env: sandbox
    });
  }
}

const codeStarConnectionArn: string = 'arn:aws:codestar-connections:eu-west-1:418648875085:connection/4f647929-c982-4f30-94f4-24ff7dbf9766';


export class MyPipeline extends Stack {

  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id)

    const repository = cdkpipelines.CodePipelineSource.connection('GemeenteNijmegen/webformulieren-dummy', 'main', {
      connectionArn: codeStarConnectionArn,
    });

    const pipeline = new cdkpipelines.CodePipeline(this, 'pipeline', {
      pipelineName: `eform-and-formio-pipeline-main`,
      crossAccountKeys: true,
      synth: new cdkpipelines.ShellStep('Synth', {
        input: repository,
        commands: [
          'yarn install --frozen-lockfile', //nodig om projen geinstalleerd te krijgen
          'yarn build',
        ],
      }),
    });


    pipeline.addStage(new MyStage(this, 'webformulieren-dummy-my-stage'))

  }


}

const app = new App();

new MyPipeline(app, 'webformulierne-dummy-project-pipeline', { env: deploymentAccount });

app.synth();