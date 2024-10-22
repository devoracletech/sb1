// Update the topUpMutation in Wallet.tsx
const topUpMutation = useMutation(
  async (data: TopUpFormData) => {
    switch (data.method) {
      case 'CARD':
        const response = await axios.post('/api/wallet/flutterwave-payment', {
          amount: data.amount,
          email: user?.email,
          name: `${user?.firstName} ${user?.lastName}`,
          phone: user?.phoneNumber,
        });
        
        // Initialize Flutterwave payment
        const config = {
          public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
          tx_ref: response.data.transactionRef,
          amount: data.amount,
          currency: 'NGN',
          payment_options: 'card,ussd,bank_transfer',
          customer: {
            email: user?.email,
            name: `${user?.firstName} ${user?.lastName}`,
            phone_number: user?.phoneNumber,
          },
          customizations: {
            title: 'PayEase Wallet Top Up',
            description: 'Payment for wallet top up',
            logo: 'https://your-logo-url.com/logo.png',
          },
          callback: async (response: any) => {
            if (response.status === 'successful') {
              // Verify payment on backend
              await axios.post('/api/wallet/verify-payment', {
                transactionId: response.transaction_id,
                transactionRef: response.tx_ref,
              });
              toast.success('Payment successful!');
              reset();
            } else {
              toast.error('Payment failed');
            }
          },
          onClose: () => {
            toast.error('Payment cancelled');
          },
        };

        window.FlutterwaveCheckout(config);
        return;

      case 'USSD':
        setShowUSSDCode(true);
        const code = generateUSSDCode(data.bank || '');
        setUssdCode(`${code}${data.amount}#`);
        return;

      case 'BANK_TRANSFER':
        setShowBankDetails(true);
        return axios.post('/api/wallet/bank-transfer', data);

      case 'AGENCY_BANKING':
        return axios.post('/api/wallet/agency-banking', data);
    }
  },
  {
    onError: (error: any) => {
      toast.error(error.message || 'Payment failed');
    },
  }
);