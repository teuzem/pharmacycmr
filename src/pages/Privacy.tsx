import React from 'react';

export function Privacy() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto prose lg:prose-xl">
        <h1>Politique de Confidentialité</h1>
        <p className="text-gray-500">Dernière mise à jour : 20 Juillet 2025</p>

        <h2>1. Collecte des Informations</h2>
        <p>
          Nous collectons des informations lorsque vous vous inscrivez sur notre site, passez une commande, ou téléchargez une ordonnance. Les informations collectées incluent votre nom, votre adresse e-mail, votre numéro de téléphone, et votre adresse postale.
        </p>

        <h2>2. Utilisation des Informations</h2>
        <p>
          Toutes les informations que nous recueillons auprès de vous peuvent être utilisées pour :
        </p>
        <ul>
          <li>Personnaliser votre expérience et répondre à vos besoins individuels</li>
          <li>Fournir un contenu publicitaire personnalisé</li>
          <li>Améliorer notre site Web</li>
          <li>Améliorer le service client et vos besoins de prise en charge</li>
          <li>Vous contacter par e-mail</li>
          <li>Administrer un concours, une promotion, ou une enquête</li>
        </ul>

        <h2>3. Confidentialité des Informations de Santé</h2>
        <p>
          Nous prenons la confidentialité de vos informations de santé très au sérieux. Les ordonnances et autres données de santé sont stockées de manière sécurisée et ne sont accessibles qu'au personnel pharmaceutique autorisé.
        </p>

        <h2>4. Divulgation à des Tiers</h2>
        <p>
          Nous ne vendons, n'échangeons et ne transférons pas vos informations personnelles identifiables à des tiers.
        </p>
        
        <h2>5. Sécurité des Informations</h2>
        <p>
          Nous mettons en œuvre une variété de mesures de sécurité pour préserver la sécurité de vos informations personnelles. Nous utilisons un cryptage de pointe pour protéger les informations sensibles transmises en ligne.
        </p>
      </div>
    </div>
  );
}
