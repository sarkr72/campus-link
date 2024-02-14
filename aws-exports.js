const awsconfig = {
    Auth: {
      region: 'us-east-1',
      userPoolId: 'us-east-1_w16yPruk8',
      userPoolWebClientId: '47353077-a583-4de1-89c6-20f9aa596568',
      identityPoolId: 'us-east-1:dce564e5-c2f8-4381-bda4-2eeddec567f6',
    },
    API: {
      endpoints: [
        {
          name: 'YOUR_API_NAME',
          endpoint: 'YOUR_API_ENDPOINT',
        },
      ],
    },
  };
  
  export default awsconfig;
  