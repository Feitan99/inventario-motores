export default function Location() {
  return (
    <section id="ubicacion" className="location-section">
      <div className="location-inner">
        <div className="location-content">
          <div className="location-title">
            <span>Ubicación</span>
            Visítanos en nuestra sucursal
          </div>
          <p className="location-desc">
            Contamos con amplias y modernas instalaciones para almacenar nuestro stock de más de 500 motores en óptimas condiciones. Ven a visitarnos y recibe asesoramiento experto directo de nuestros mecánicos especialistas.
          </p>
          <div className="location-details">
            <div className="detail-item">
              <svg width="24" height="24" style={{ minWidth: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <strong>Dirección:</strong>
                <span>Camino a Melipilla 4500, Peñaflor, Región Metropolitana, Chile</span>
              </div>
            </div>
            <div className="detail-item">
              <svg width="24" height="24" style={{ minWidth: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong>Horario de atención:</strong>
                <span>Lunes a Viernes: 09:00 - 18:00 hrs<br/>Sábados: 09:00 - 14:00 hrs</span>
              </div>
            </div>
          </div>
        </div>
        <div className="location-map">
          {/* Using a stable iframe for Google Maps pointing to Peñaflor, RM */}
          <iframe 
            src="https://maps.google.com/maps?q=Pe%C3%B1aflor,+Chile&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa de Ubicación Peñaflor"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
