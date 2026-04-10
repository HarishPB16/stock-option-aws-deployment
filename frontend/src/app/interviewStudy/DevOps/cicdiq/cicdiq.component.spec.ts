import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CICDIQComponent } from './cicdiq.component';

describe('CICDIQComponent', () => {
  let component: CICDIQComponent;
  let fixture: ComponentFixture<CICDIQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CICDIQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CICDIQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
