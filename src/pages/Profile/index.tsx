import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import { PrimaryButton } from '@entur/button';
import { Heading1, Paragraph } from '@entur/typography';

const Profile: React.FC = () => {
  const { user, logout } = useAuth0();

  if (!user) {
    return (
      <div>
        <Heading1>Hei!</Heading1>
        <Paragraph>
          For å se denne siden må du være innlogget. Det er du ikke, så denne
          teksten skal aldri kunne være synlig.
        </Paragraph>
      </div>
    );
  }

  return (
    <div>
      <Heading1>Hei, {user.given_name}!</Heading1>
      <Paragraph>
        For å se denne siden må du være innlogget. Og det er du!
      </Paragraph>
      <PrimaryButton
        onClick={() => logout({ returnTo: window.location.origin })}
      >
        Logg ut
      </PrimaryButton>
    </div>
  );
};

export default Profile;
