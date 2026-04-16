import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { BeneficioService } from './beneficio.service';

describe('BeneficioService', () => {
  let service: BeneficioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BeneficioService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(BeneficioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list benefits', () => {
    const mockResponse = [
      { id: 1, nome: 'Benefício A', descricao: 'Descrição A', valor: 1000, ativo: true }
    ];

    service.list().subscribe(response => {
      expect(response.length).toBe(1);
      expect(response[0].nome).toBe('Benefício A');
    });

    const req = httpMock.expectOne('/api/v1/beneficios');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create benefit', () => {
    const body = { nome: 'Novo', descricao: 'Teste', valor: 100, ativo: true };

    service.create(body).subscribe(response => {
      expect(response.nome).toBe('Novo');
    });

    const req = httpMock.expectOne('/api/v1/beneficios');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 10, ...body });
  });

  it('should update benefit', () => {
    const body = { nome: 'Atualizado', descricao: 'Teste', valor: 200, ativo: true };

    service.update(1, body).subscribe(response => {
      expect(response.nome).toBe('Atualizado');
    });

    const req = httpMock.expectOne('/api/v1/beneficios/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 1, ...body });
  });

  it('should delete benefit', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('/api/v1/beneficios/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should transfer amount', () => {
    const body = { fromId: 1, toId: 2, amount: 50 };

    service.transfer(body).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('/api/v1/beneficios/transfer');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(null);
  });
});